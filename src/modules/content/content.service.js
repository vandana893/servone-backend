const Content = require('./content.model');

const throwError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
};

const formatSlug = (slug) => {
  if (!slug) return null;
  return slug
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

const validateTypeSpecificFields = (type, data) => {
  switch (type) {
    case 'BANNER':
      if (!data.title || !data.imageUrl) throwError('Banner requires title and imageUrl');
      break;
    case 'FAQ':
      if (!data.question || !data.answer) throwError('FAQ requires question and answer');
      break;
    case 'PAGE':
    case 'POLICY':
      if (!data.title || !data.slug || !data.content) throwError(`${type} requires title, slug, and content`);
      break;
    case 'BLOG':
      if (!data.title || !data.slug || !data.content) throwError('Blog requires title, slug, and content');
      break;
    default:
      throwError('Invalid content type');
  }
};

const checkDuplicateSlug = async (slug, excludeId = null) => {
  if (!slug) return;
  const filter = { slug };
  if (excludeId) filter._id = { $ne: excludeId };
  const existing = await Content.findOne(filter);
  if (existing) throwError('Content with this slug already exists', 409);
};

const createContent = async (data) => {
  validateTypeSpecificFields(data.type, data);
  if (data.slug) {
    data.slug = formatSlug(data.slug);
    await checkDuplicateSlug(data.slug);
  }

  const content = new Content(data);
  await content.save();
  return content;
};

const getContent = async (query, asAdmin = false) => {
  const { type, isActive, search, page = 1, limit = 20 } = query;
  
  const filter = {};
  if (type) filter.type = type;
  
  if (asAdmin) {
    if (isActive !== undefined) filter.isActive = isActive;
  } else {
    filter.isActive = true; // Public users only see active content
  }

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { question: { $regex: search, $options: 'i' } },
      { slug: { $regex: search, $options: 'i' } },
      { author: { $regex: search, $options: 'i' } }
    ];
  }
  
  const skip = (page - 1) * limit;
  
  let sortCriteria = { createdAt: -1 };
  if (type === 'BANNER') {
    sortCriteria = { displayOrder: 1, createdAt: -1 };
  } else if (!type) {
    // Mixed content, just sort by createdAt
    sortCriteria = { createdAt: -1 };
  }

  const [data, total] = await Promise.all([
    Content.find(filter)
      .skip(skip)
      .limit(limit)
      .sort(sortCriteria),
    Content.countDocuments(filter)
  ]);
  
  return { data, total, page, limit };
};

const getContentBySlug = async (slug) => {
  const formattedSlug = formatSlug(slug);
  return await Content.findOne({ slug: formattedSlug, isActive: true });
};

const updateContent = async (id, data) => {
  const content = await Content.findById(id);
  if (!content) throwError('Content not found', 404);

  // Type is immutable
  if (data.type && data.type !== content.type) {
    throwError('Content type cannot be changed after creation');
  }

  const newType = content.type;
  
  // Merge current data with new data for validation
  const mergedData = { ...content.toObject(), ...data };
  validateTypeSpecificFields(newType, mergedData);

  if (data.slug !== undefined) {
    if (data.slug) {
      data.slug = formatSlug(data.slug);
      await checkDuplicateSlug(data.slug, id);
    } else {
      // Allow clearing slug if it's not required
      data.slug = null;
    }
  }

  // Remove type to ensure it's not overwritten accidentally
  delete data.type;

  return await Content.findByIdAndUpdate(
    id,
    { $set: data },
    { new: true, runValidators: true }
  );
};

const updateContentStatus = async (id, isActive) => {
  const content = await Content.findByIdAndUpdate(
    id,
    { isActive },
    { new: true, runValidators: true }
  );
  if (!content) throwError('Content not found', 404);
  return content;
};

const deleteContent = async (id) => {
  const content = await Content.findById(id);
  if (!content) throwError('Content not found', 404);
  
  return await Content.findByIdAndDelete(id);
};

module.exports = {
  createContent,
  getContent,
  getContentBySlug,
  updateContent,
  updateContentStatus,
  deleteContent
};
