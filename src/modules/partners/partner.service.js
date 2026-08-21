const Partner = require('./partner.model');

const throwError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
};

const getPartnerById = async (partnerId) => {
  const partner = await Partner.findById(partnerId).select('-password');
  if (!partner) throwError('Partner not found', 404);
  return partner;
};

const getAllPartners = async (query = {}, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const [partners, total] = await Promise.all([
    Partner.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
    Partner.countDocuments(query)
  ]);
  
  return {
    data: partners,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  };
};

const updatePartnerStatus = async (partnerId, status) => {
  const partner = await Partner.findByIdAndUpdate(
    partnerId, 
    { status }, 
    { returnDocument: 'after', runValidators: true }
  );
  if (!partner) throwError('Partner not found', 404);
  return partner;
};

const updatePartnerProfile = async (partnerId, updateData) => {
  const partner = await Partner.findByIdAndUpdate(
    partnerId,
    { $set: updateData },
    { returnDocument: 'after', runValidators: true }
  ).select('-password');
  
  if (!partner) throwError('Partner not found', 404);
  return partner;
};

// BSP specific: Add a worker
const addWorker = async (partnerId, workerData) => {
  const partner = await Partner.findById(partnerId);
  if (!partner) throwError('Partner not found', 404);
  if (partner.partnerType !== 'BSP') throwError('Only BSP partners can manage workers', 403);

  partner.workers.push(workerData);
  await partner.save();
  return partner.workers;
};

// BSP specific: Update a worker
const updateWorker = async (partnerId, workerId, workerData) => {
  const partner = await Partner.findById(partnerId);
  if (!partner) throwError('Partner not found', 404);
  if (partner.partnerType !== 'BSP') throwError('Only BSP partners can manage workers', 403);

  const worker = partner.workers.id(workerId);
  if (!worker) throwError('Worker not found', 404);

  Object.assign(worker, workerData);
  await partner.save();
  return partner.workers;
};

// BSP specific: Delete a worker
const deleteWorker = async (partnerId, workerId) => {
  const partner = await Partner.findById(partnerId);
  if (!partner) throwError('Partner not found', 404);
  if (partner.partnerType !== 'BSP') throwError('Only BSP partners can manage workers', 403);

  const worker = partner.workers.id(workerId);
  if (!worker) throwError('Worker not found', 404);

  partner.workers.pull({ _id: workerId });
  await partner.save();
  return partner.workers;
};

// KYC specific
const submitKyc = async (partnerId, kycData) => {
  const partner = await Partner.findById(partnerId);
  if (!partner) throwError('Partner not found', 404);

  partner.kycDetails = {
    aadharNumber: kycData.aadharNumber,
    panNumber: kycData.panNumber,
    tradeLicenseNumber: kycData.tradeLicenseNumber
  };
  partner.verificationStatus = 'UNDER_REVIEW';
  await partner.save();
  
  return partner;
};

const verifyKyc = async (partnerId, status, notes) => {
  const partner = await Partner.findById(partnerId);
  if (!partner) throwError('Partner not found', 404);

  partner.verificationStatus = status;
  // If APPROVED, we might also want to set the overall status to APPROVED
  if (status === 'APPROVED' && partner.status === 'PENDING') {
    partner.status = 'APPROVED';
  }
  
  // Note: could store admin notes in a separate field if added to model later
  await partner.save();
  return partner;
};

module.exports = {
  getPartnerById,
  getAllPartners,
  updatePartnerStatus,
  updatePartnerProfile,
  addWorker,
  updateWorker,
  deleteWorker,
  submitKyc,
  verifyKyc
};
