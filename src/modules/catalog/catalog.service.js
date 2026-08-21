const Category = require('./category.model');
const Subcategory = require('./subcategory.model');
const Service = require('./service.model');
const Booking = require('../bookings/booking.model');

// Helper to throw business errors
const throwError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
};

// ==========================================
// Categories
// ==========================================
const getCategories = async (query) => {
  const { isActive, page, limit } = query;
  const filter = {};
  if (isActive !== undefined) filter.isActive = isActive;
  
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    Category.find(filter).skip(skip).limit(limit).sort({ name: 1 }),
    Category.countDocuments(filter)
  ]);
  
  return { data, total, page, limit };
};

const getCategoryById = async (id) => {
  return await Category.findById(id);
};

const createCategory = async (data) => {
  const exists = await Category.findOne({ name: data.name });
  if (exists) throwError('Category with this name already exists');
  
  return await Category.create(data);
};

const updateCategory = async (id, data) => {
  if (data.name) {
    const exists = await Category.findOne({ name: data.name, _id: { $ne: id } });
    if (exists) throwError('Category with this name already exists');
  }
  
  const category = await Category.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true });
  if (!category) throwError('Category not found', 404);
  return category;
};

const updateCategoryStatus = async (id, isActive) => {
  const category = await Category.findByIdAndUpdate(id, { isActive }, { returnDocument: 'after' });
  if (!category) throwError('Category not found', 404);
  
  if (!isActive) {
    // Cascade deactivation to children
    await Subcategory.updateMany({ categoryId: id }, { isActive: false });
    await Service.updateMany({ categoryId: id }, { isActive: false });
  }

  return category;
};

const deleteCategory = async (id) => {
  const category = await Category.findById(id);
  if (!category) throwError('Category not found', 404);
  
  // Checking bookings just in case, though services check usually suffices
  const hasBookings = await Booking.exists({ categoryId: id });
  if (hasBookings) {
    throwError('Cannot delete category because it is referenced in bookings. Please deactivate it instead.');
  }

  // Cascade delete Subcategories and Services
  await Service.deleteMany({ categoryId: id });
  await Subcategory.deleteMany({ categoryId: id });
  
  await Category.findByIdAndDelete(id);
  return { message: 'Category deleted successfully' };
};

// ==========================================
// Subcategories
// ==========================================
const getAllSubcategories = async (query) => {
  const { isActive, page, limit } = query;
  const filter = {};
  if (isActive !== undefined) filter.isActive = isActive;
  
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    Subcategory.find(filter).populate('categoryId', 'name').skip(skip).limit(limit).sort({ name: 1 }),
    Subcategory.countDocuments(filter)
  ]);
  
  return { data, total, page, limit };
};

const getSubcategories = async (categoryId, query) => {
  const { isActive, page, limit } = query;
  const filter = { categoryId };
  if (isActive !== undefined) filter.isActive = isActive;
  
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    Subcategory.find(filter).skip(skip).limit(limit).sort({ name: 1 }),
    Subcategory.countDocuments(filter)
  ]);
  
  return { data, total, page, limit };
};

const getSubcategoryById = async (id) => {
  return await Subcategory.findById(id);
};

const createSubcategory = async (categoryId, data) => {
  const category = await Category.findById(categoryId);
  if (!category) throwError('Parent category not found', 404);
  if (!category.isActive) throwError('Cannot create subcategory under an inactive category');

  const exists = await Subcategory.findOne({ categoryId, name: data.name });
  if (exists) throwError('Subcategory with this name already exists under the same category');
  
  data.categoryId = categoryId;
  return await Subcategory.create(data);
};

const updateSubcategory = async (id, data) => {
  const subcategory = await Subcategory.findById(id);
  if (!subcategory) throwError('Subcategory not found', 404);

  if (data.name) {
    const exists = await Subcategory.findOne({ 
      categoryId: subcategory.categoryId, 
      name: data.name, 
      _id: { $ne: id } 
    });
    if (exists) throwError('Subcategory with this name already exists under the same category');
  }
  
  const updated = await Subcategory.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true });
  return updated;
};

const updateSubcategoryStatus = async (id, isActive) => {
  const subcategory = await Subcategory.findByIdAndUpdate(id, { isActive }, { returnDocument: 'after' });
  if (!subcategory) throwError('Subcategory not found', 404);
  
  if (!isActive) {
    // Cascade deactivation to children
    await Service.updateMany({ subcategoryId: id }, { isActive: false });
  }
  
  return subcategory;
};

const deleteSubcategory = async (id) => {
  const subcategory = await Subcategory.findById(id);
  if (!subcategory) throwError('Subcategory not found', 404);
  
  const hasBookings = await Booking.exists({ subcategoryId: id });
  if (hasBookings) {
    throwError('Cannot delete subcategory because it is referenced in bookings. Please deactivate it instead.');
  }

  // Cascade delete Services
  await Service.deleteMany({ subcategoryId: id });

  await Subcategory.findByIdAndDelete(id);
  return { message: 'Subcategory deleted successfully' };
};

// ==========================================
// Services
// ==========================================
const getServices = async (query) => {
  const { categoryId, subcategoryId, serviceType, isEmergencyAvailable, isActive, search, page, limit } = query;
  const filter = {};
  
  if (categoryId) filter.categoryId = categoryId;
  if (subcategoryId) filter.subcategoryId = subcategoryId;
  if (serviceType) filter.serviceType = serviceType;
  if (isEmergencyAvailable !== undefined) filter.isEmergencyAvailable = isEmergencyAvailable;
  if (isActive !== undefined) filter.isActive = isActive;
  
  if (search) {
    filter.name = { $regex: search, $options: 'i' };
  }
  
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    Service.find(filter).populate('categoryId subcategoryId', 'name').skip(skip).limit(limit).sort({ name: 1 }),
    Service.countDocuments(filter)
  ]);
  
  return { data, total, page, limit };
};

const getServiceById = async (id) => {
  return await Service.findById(id).populate('categoryId subcategoryId', 'name description');
};

const createService = async (data) => {
  const category = await Category.findById(data.categoryId);
  if (!category) throwError('Category not found', 404);
  if (!category.isActive) throwError('Cannot create a service under an inactive category');

  const subcategory = await Subcategory.findById(data.subcategoryId);
  if (!subcategory) throwError('Subcategory not found', 404);
  if (!subcategory.isActive) throwError('Cannot create a service under an inactive subcategory');
  
  if (subcategory.categoryId.toString() !== data.categoryId.toString()) {
    throwError('The selected subcategory does not belong to the selected category');
  }

  const exists = await Service.findOne({ 
    categoryId: data.categoryId, 
    subcategoryId: data.subcategoryId, 
    name: data.name 
  });
  if (exists) throwError('Service with this name already exists in the selected subcategory');

  return await Service.create(data);
};

const updateService = async (id, data) => {
  const service = await Service.findById(id);
  if (!service) throwError('Service not found', 404);

  let newCategoryId = data.categoryId || service.categoryId.toString();
  let newSubcategoryId = data.subcategoryId || service.subcategoryId.toString();
  
  // Validate Category & Subcategory changes and active status
  const category = await Category.findById(newCategoryId);
  if (!category) throwError('Category not found', 404);
  if (!category.isActive) throwError('Cannot assign service to an inactive category');

  const subcategory = await Subcategory.findById(newSubcategoryId);
  if (!subcategory) throwError('Subcategory not found', 404);
  if (!subcategory.isActive) throwError('Cannot assign service to an inactive subcategory');
  
  if (subcategory.categoryId.toString() !== newCategoryId.toString()) {
    throwError('The selected subcategory does not belong to the selected category');
  }

  if (data.name || data.categoryId || data.subcategoryId) {
    const finalName = data.name || service.name;
    const exists = await Service.findOne({ 
      categoryId: newCategoryId, 
      subcategoryId: newSubcategoryId, 
      name: finalName,
      _id: { $ne: id }
    });
    if (exists) throwError('Service with this name already exists in the selected subcategory');
  }

  const updated = await Service.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true });
  return updated;
};

const updateServiceStatus = async (id, isActive) => {
  const service = await Service.findById(id);
  if (!service) throwError('Service not found', 404);

  // When activating a service, ensure its parents are active
  if (isActive) {
    const category = await Category.findById(service.categoryId);
    if (!category || !category.isActive) throwError('Cannot activate service because its category is inactive');
    
    const subcategory = await Subcategory.findById(service.subcategoryId);
    if (!subcategory || !subcategory.isActive) throwError('Cannot activate service because its subcategory is inactive');
  }

  return await Service.findByIdAndUpdate(id, { isActive }, { returnDocument: 'after' });
};

const deleteService = async (id) => {
  const service = await Service.findById(id);
  if (!service) throwError('Service not found', 404);
  
  const hasBookings = await Booking.exists({ serviceId: id });
  if (hasBookings) {
    throwError('Cannot delete service because it has associated bookings. Please deactivate it instead.');
  }

  await Service.findByIdAndDelete(id);
  return { message: 'Service deleted successfully' };
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  updateCategoryStatus,
  deleteCategory,
  
  getAllSubcategories,
  getSubcategories,
  getSubcategoryById,
  createSubcategory,
  updateSubcategory,
  updateSubcategoryStatus,
  deleteSubcategory,
  
  getServices,
  getServiceById,
  createService,
  updateService,
  updateServiceStatus,
  deleteService
};
