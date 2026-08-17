const Joi = require('joi');

const idSchema = {
  params: Joi.object({
    id: Joi.string().hex().length(24).required()
  })
};

// --- Category Schemas ---
const categoryQuerySchema = {
  query: Joi.object({
    isActive: Joi.boolean(),
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(20)
  })
};

const createCategorySchema = {
  body: Joi.object({
    name: Joi.string().required().max(100),
    description: Joi.string().allow('', null).max(500),
    icon: Joi.string().uri().allow('', null),
    isActive: Joi.boolean().default(true)
  })
};

const updateCategorySchema = {
  body: Joi.object({
    name: Joi.string().max(100),
    description: Joi.string().allow('', null).max(500),
    icon: Joi.string().uri().allow('', null),
    isActive: Joi.boolean()
  }).min(1)
};

const categoryStatusSchema = {
  body: Joi.object({
    isActive: Joi.boolean().required()
  })
};

// --- Subcategory Schemas ---
const createSubcategorySchema = {
  body: Joi.object({
    name: Joi.string().required().max(100),
    description: Joi.string().allow('', null).max(500),
    icon: Joi.string().uri().allow('', null),
    isActive: Joi.boolean().default(true)
  })
};

const updateSubcategorySchema = {
  body: Joi.object({
    name: Joi.string().max(100),
    description: Joi.string().allow('', null).max(500),
    icon: Joi.string().uri().allow('', null),
    isActive: Joi.boolean()
  }).min(1)
};

const subcategoryStatusSchema = {
  body: Joi.object({
    isActive: Joi.boolean().required()
  })
};

// --- Service Schemas ---
const serviceQuerySchema = {
  query: Joi.object({
    categoryId: Joi.string().hex().length(24),
    subcategoryId: Joi.string().hex().length(24),
    serviceType: Joi.string(),
    isEmergencyAvailable: Joi.boolean(),
    isActive: Joi.boolean(),
    search: Joi.string(),
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(20)
  })
};

const createServiceSchema = {
  body: Joi.object({
    categoryId: Joi.string().hex().length(24).required(),
    subcategoryId: Joi.string().hex().length(24).required(),
    name: Joi.string().required().max(150),
    description: Joi.string().allow('', null).max(2000),
    serviceType: Joi.string().valid('Instant', 'Scheduled', 'Request-based').default('Scheduled'),
    pricingModel: Joi.string().valid('Fixed', 'Starting From', 'Per Hour', 'Per Visit', 'Per Unit', 'Quote').required(),
    price: Joi.number().min(0),
    estimatedDuration: Joi.string().allow('', null).max(100),
    providerType: Joi.string().valid('Individual professional', 'Local business', 'Field professional', 'Equipment owner', 'Local worker/team', 'Authorized partner', 'Any').default('Any'),
    variants: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        price: Joi.number().min(0).required(),
        description: Joi.string().allow('', null)
      })
    ),
    requiredDocuments: Joi.array().items(Joi.string()),
    supportedLanguages: Joi.array().items(Joi.string()),
    serviceAreaRadius: Joi.number().min(0).default(10),
    requiresMaterial: Joi.boolean().default(false),
    materialsIncluded: Joi.array().items(Joi.string()),
    materialsExcluded: Joi.array().items(Joi.string()),
    additionalCharges: Joi.array().items(Joi.string()),
    cancellationPolicy: Joi.string().allow('', null).max(1000),
    warranty: Joi.string().allow('', null).max(500),
    photos: Joi.array().items(Joi.string().uri()),
    isEmergencyAvailable: Joi.boolean().default(false),
    isHomeVisitAvailable: Joi.boolean().default(true),
    isActive: Joi.boolean().default(true)
  })
};

const updateServiceSchema = {
  body: Joi.object({
    categoryId: Joi.string().hex().length(24),
    subcategoryId: Joi.string().hex().length(24),
    name: Joi.string().max(150),
    description: Joi.string().allow('', null).max(2000),
    serviceType: Joi.string().valid('Instant', 'Scheduled', 'Request-based'),
    pricingModel: Joi.string().valid('Fixed', 'Starting From', 'Per Hour', 'Per Visit', 'Per Unit', 'Quote'),
    price: Joi.number().min(0),
    estimatedDuration: Joi.string().allow('', null).max(100),
    providerType: Joi.string().valid('Individual professional', 'Local business', 'Field professional', 'Equipment owner', 'Local worker/team', 'Authorized partner', 'Any'),
    variants: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        price: Joi.number().min(0).required(),
        description: Joi.string().allow('', null)
      })
    ),
    requiredDocuments: Joi.array().items(Joi.string()),
    supportedLanguages: Joi.array().items(Joi.string()),
    serviceAreaRadius: Joi.number().min(0),
    requiresMaterial: Joi.boolean(),
    materialsIncluded: Joi.array().items(Joi.string()),
    materialsExcluded: Joi.array().items(Joi.string()),
    additionalCharges: Joi.array().items(Joi.string()),
    cancellationPolicy: Joi.string().allow('', null).max(1000),
    warranty: Joi.string().allow('', null).max(500),
    photos: Joi.array().items(Joi.string().uri()),
    isEmergencyAvailable: Joi.boolean(),
    isHomeVisitAvailable: Joi.boolean(),
    isActive: Joi.boolean()
  }).min(1)
};

const serviceStatusSchema = {
  body: Joi.object({
    isActive: Joi.boolean().required()
  })
};

module.exports = {
  idSchema,
  categoryQuerySchema,
  createCategorySchema,
  updateCategorySchema,
  categoryStatusSchema,
  createSubcategorySchema,
  updateSubcategorySchema,
  subcategoryStatusSchema,
  serviceQuerySchema,
  createServiceSchema,
  updateServiceSchema,
  serviceStatusSchema
};
