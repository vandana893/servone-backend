const Joi = require('joi');

const updatePartnerProfileSchema = {
  body: Joi.object({
    name: Joi.string().trim().max(100),
    businessName: Joi.string().trim().max(100),
    businessType: Joi.string().trim().max(100).allow(''),
    establishedYear: Joi.number().optional().allow(null, ''),
    employees: Joi.number().optional().allow(null, ''),
    website: Joi.string().trim().optional().allow(''),
    email: Joi.string().email().optional().allow(''),
    phone: Joi.string().trim().optional().allow(''),
    kycDetails: Joi.object({
      panNumber: Joi.string().trim().optional().allow(''),
      tradeLicenseNumber: Joi.string().trim().optional().allow(''),
      registrationNumber: Joi.string().trim().optional().allow('')
    }).unknown(true).optional(),
    brand: Joi.string().trim().max(100),
    photo: Joi.string(),
    skills: Joi.array().items(Joi.string().trim().max(50)),
    categories: Joi.array().items(Joi.string().hex().length(24)),
    subcategories: Joi.array().items(Joi.string().hex().length(24)),
    services: Joi.array().items(Joi.string().hex().length(24)),
    address: Joi.object({
      houseNo: Joi.string().trim(),
      locality: Joi.string().trim(),
      village: Joi.string().trim(),
      pinCode: Joi.string().trim(),
      district: Joi.string().trim(),
      state: Joi.string().trim(),
      location: Joi.object({
        type: Joi.string().valid('Point').default('Point'),
        coordinates: Joi.array().ordered(
          Joi.number().min(-180).max(180).required(), // Longitude
          Joi.number().min(-90).max(90).required()    // Latitude
        ).length(2)
      })
    }),
    workingHours: Joi.object({
      start: Joi.string().pattern(/^([01]\d|2[0-3]):?([0-5]\d)$/),
      end: Joi.string().pattern(/^([01]\d|2[0-3]):?([0-5]\d)$/)
    }),
    isOnline: Joi.boolean(),
    serviceRadius: Joi.number().positive().max(1000)
  }).min(1).unknown(false)
};

const addWorkerSchema = {
  body: Joi.object({
    name: Joi.string().trim().max(100).required(),
    phone: Joi.string().trim().max(20).required(),
    skills: Joi.array().items(Joi.string().trim().max(50)),
    categories: Joi.array().items(Joi.string().hex().length(24)),
    availability: Joi.boolean()
  }).unknown(false)
};

const updateWorkerSchema = {
  body: Joi.object({
    name: Joi.string().trim().max(100),
    phone: Joi.string().trim().max(20),
    skills: Joi.array().items(Joi.string().trim().max(50)),
    categories: Joi.array().items(Joi.string().hex().length(24)),
    availability: Joi.boolean(),
    status: Joi.string().valid('Active', 'Inactive')
  }).min(1).unknown(false)
};

const workerIdSchema = {
  params: Joi.object({
    workerId: Joi.string().hex().length(24).required()
  })
};

const submitKycSchema = {
  body: Joi.object({
    aadharNumber: Joi.string().trim().optional().allow(''),
    panNumber: Joi.string().trim().optional().allow(''),
    tradeLicenseNumber: Joi.string().trim().optional().allow(''),
    documentType: Joi.string().trim().optional().allow(''),
    documentNumber: Joi.string().trim().optional().allow(''),
    documents: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        base64: Joi.string().optional(),
        url: Joi.string().optional()
      }).unknown(true)
    ).optional()
  }).unknown(false)
};

const verifyKycSchema = {
  params: Joi.object({
    id: Joi.string().hex().length(24).required()
  }),
  body: Joi.object({
    status: Joi.string().valid('APPROVED', 'REJECTED').required(),
    notes: Joi.string().optional().allow('')
  }).unknown(false)
};

module.exports = {
  updatePartnerProfileSchema,
  addWorkerSchema,
  updateWorkerSchema,
  workerIdSchema,
  submitKycSchema,
  verifyKycSchema
};
