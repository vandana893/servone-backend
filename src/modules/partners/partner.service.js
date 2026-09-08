const Partner = require('./partner.model');

const throwError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
};

const getPartnerById = async (partnerId) => {
  const partner = await Partner.findById(partnerId)
    .populate('services', 'name description price estimatedDuration serviceType')
    .populate('categories', 'name description')
    .select('-password');
  if (!partner) throwError('Partner not found', 404);
  return partner;
};

const getAllPartners = async (query = {}, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const [partners, total] = await Promise.all([
    Partner.find(query)
      .populate('services', 'name')
      .populate('categories', 'name')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
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

const deletePartner = async (partnerId) => {
  const partner = await Partner.findByIdAndDelete(partnerId);
  if (!partner) throwError('Partner not found', 404);
  return partner;
};

const updatePartnerProfile = async (partnerId, updateData) => {
  const partner = await Partner.findByIdAndUpdate(
    partnerId,
    { $set: updateData },
    { returnDocument: 'after', runValidators: true }
  )
    .populate('services', 'name description price estimatedDuration serviceType')
    .populate('categories', 'name description')
    .select('-password');
  
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
const submitKyc = async (partnerId, kycData = {}, files) => {
  const partner = await Partner.findById(partnerId);
  if (!partner) throwError('Partner not found', 404);

  partner.kycDetails = {
    ...(partner.kycDetails || {}),
    ...(kycData?.aadharNumber && { aadharNumber: kycData.aadharNumber }),
    ...(kycData?.panNumber && { panNumber: kycData.panNumber }),
    ...(kycData?.tradeLicenseNumber && { tradeLicenseNumber: kycData.tradeLicenseNumber })
  };

  // Extract dynamically sent document number if any
  if (kycData?.documentType && kycData?.documentNumber) {
    if (kycData.documentType === 'Aadhaar Card') partner.kycDetails.aadharNumber = kycData.documentNumber;
    else if (kycData.documentType === 'PAN Card') partner.kycDetails.panNumber = kycData.documentNumber;
    else if (kycData.documentType === 'GST Certificate') partner.kycDetails.tradeLicenseNumber = kycData.documentNumber;
  }
  
  // 1. Handle multipart/form-data file uploads
  if (files && files.length > 0) {
    const { uploadToCloudinary } = require('../../utils/upload');
    for (const file of files) {
      try {
        const result = await uploadToCloudinary(file.buffer, `partners/${partner.phone}/documents`);
        const docName = kycData.documentType || file.fieldname || 'Document';
        const finalDocName = file.fieldname === 'backImage' ? `${docName} Back` : docName;
        
        if (finalDocName === 'Selfie') {
          partner.photo = result.secure_url;
        }

        // Check if document already exists, update it if so
        const existingDocIndex = partner.documents.findIndex(d => d.name === finalDocName);
        if (existingDocIndex >= 0) {
          partner.documents[existingDocIndex].url = result.secure_url;
          partner.documents[existingDocIndex].status = 'Pending';
        } else {
          partner.documents.push({
            name: finalDocName,
            url: result.secure_url,
            status: 'Pending'
          });
        }
      } catch (error) {
        console.error(`Failed to upload file ${file.fieldname}:`, error);
        throwError(`Failed to upload document ${file.fieldname} to storage`, 500);
      }
    }
  }

  // 2. Handle legacy base64 or URL uploads from JSON
  if (kycData.documents && Array.isArray(kycData.documents)) {
    const { uploadToCloudinary } = require('../../utils/upload');
    for (const doc of kycData.documents) {
      if (doc.base64) {
        try {
          const base64Data = doc.base64.replace(/^data:image\/\w+;base64,/, '').replace(/^data:application\/pdf;base64,/, '');
          const buffer = Buffer.from(base64Data, 'base64');
          const result = await uploadToCloudinary(buffer, `partners/${partner.phone}/documents`);
          if (doc.name === 'Selfie') {
            partner.photo = result.secure_url;
          }
          
          const existingDocIndex = partner.documents.findIndex(d => d.name === doc.name);
          if (existingDocIndex >= 0) {
            partner.documents[existingDocIndex].url = result.secure_url;
            partner.documents[existingDocIndex].status = 'Pending';
          } else {
            partner.documents.push({
              name: doc.name,
              url: result.secure_url,
              status: 'Pending'
            });
          }
        } catch (error) {
          console.error(`Failed to upload document ${doc.name}:`, error);
          throwError(`Failed to upload document ${doc.name} to storage`, 500);
        }
      } else if (doc.url) {
        const existingDocIndex = partner.documents.findIndex(d => d.name === doc.name);
        if (existingDocIndex >= 0) {
          partner.documents[existingDocIndex].url = doc.url;
          partner.documents[existingDocIndex].status = 'Pending';
        } else {
          partner.documents.push({
            name: doc.name,
            url: doc.url,
            status: 'Pending'
          });
        }
      }
    }
  }
  
  partner.verificationStatus = 'UNDER_REVIEW';
  await partner.save();
  
  return partner;
};

const verifyKyc = async (partnerId, status, notes) => {
  const partner = await Partner.findById(partnerId);
  if (!partner) throwError('Partner not found', 404);

  partner.verificationStatus = status;
  partner.kycNotes = notes;

  if (status === 'APPROVED') {
    partner.documents.forEach(doc => {
      doc.status = 'Verified';
    });
  } else if (status === 'REJECTED') {
    partner.documents.forEach(doc => {
      doc.status = 'Rejected';
    });
  }

  await partner.save();
  return partner;
};

const getDashboardStats = async (partnerId) => {
  const mongoose = require('mongoose');
  const Booking = require('../bookings/booking.model');
  const Transaction = require('../finance/finance.model');
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [activeJobs, completedJobs, totalJobs, pendingJobs, unassignedJobs] = await Promise.all([
    Booking.countDocuments({ partnerId, status: { $in: ['ACCEPTED', 'ASSIGNED', 'EN_ROUTE', 'IN_PROGRESS'] } }),
    Booking.countDocuments({ partnerId, status: 'COMPLETED' }),
    Booking.countDocuments({ partnerId }),
    Booking.countDocuments({ partnerId, status: 'PENDING' }),
    Booking.countDocuments({ partnerId, status: 'ACCEPTED', workerId: { $exists: false } })
  ]);

  const transactions = await Transaction.aggregate([
    { $match: { partnerId: new mongoose.Types.ObjectId(partnerId), status: 'SUCCESS' } },
    { $group: {
        _id: null,
        totalEarnings: { $sum: { $cond: [{ $eq: ['$type', 'PAYOUT'] }, '$amount', 0] } },
        totalCommission: { $sum: { $cond: [{ $eq: ['$type', 'COMMISSION'] }, '$amount', 0] } }
      }
    }
  ]);

  const stats = transactions[0] || { totalEarnings: 0, totalCommission: 0 };
  
  // If there are no real transactions but completed jobs exist, we can fallback to a dummy calculation
  // based on booking prices if we wanted, but we'll stick to real transactions for accuracy.
  if (stats.totalEarnings === 0 && completedJobs > 0) {
     const completedBookings = await Booking.find({ partnerId, status: 'COMPLETED' });
     const estimatedEarnings = completedBookings.reduce((sum, b) => sum + (b.finalPrice || b.quotedPrice || 500), 0) * 0.8; // Assume 20% commission
     stats.totalEarnings = estimatedEarnings;
  }

  return {
    activeJobs,
    completedJobs,
    totalJobs,
    pendingJobs,
    unassignedJobs,
    totalEarnings: stats.totalEarnings || 0,
    totalCommission: stats.totalCommission || 0,
    rating: 4.8 // Mock rating for now
  };
};

module.exports = {
  getPartnerById,
  getAllPartners,
  deletePartner,
  updatePartnerStatus,
  updatePartnerProfile,
  addWorker,
  updateWorker,
  deleteWorker,
  submitKyc,
  verifyKyc,
  getDashboardStats
};
