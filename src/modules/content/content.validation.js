const Joi = require('joi');

const idSchema = {
  params: Joi.object({
    id: Joi.string().hex().length(24).required()
  })
};

const createContentSchema = {
  body: Joi.object({
    type: Joi.string().valid('BANNER', 'FAQ', 'PAGE', 'POLICY', 'BLOG').required(),
    title: Joi.string().max(300),
    imageUrl: Joi.string(), // Keeping it flexible to support relative paths
    linkUrl: Joi.string(),
    question: Joi.string().max(500),
    answer: Joi.string(),
    slug: Joi.string().max(200),
    content: Joi.string(),
    author: Joi.string().max(100),
    seoTitle: Joi.string().max(300),
    seoDescription: Joi.string().max(1000),
    displayOrder: Joi.number().default(0),
    isActive: Joi.boolean().default(true)
  })
};

const updateContentSchema = {
  body: Joi.object({
    // Type is immutable on update, so it's not accepted in body
    title: Joi.string().max(300),
    imageUrl: Joi.string().allow('', null),
    linkUrl: Joi.string().allow('', null),
    question: Joi.string().max(500).allow('', null),
    answer: Joi.string().allow('', null),
    slug: Joi.string().max(200),
    content: Joi.string().allow('', null),
    author: Joi.string().max(100).allow('', null),
    seoTitle: Joi.string().max(300).allow('', null),
    seoDescription: Joi.string().max(1000).allow('', null),
    displayOrder: Joi.number(),
    isActive: Joi.boolean()
  }).min(1)
};

const contentStatusSchema = {
  body: Joi.object({
    isActive: Joi.boolean().required()
  })
};

const queryContentSchema = {
  query: Joi.object({
    type: Joi.string().valid('BANNER', 'FAQ', 'PAGE', 'POLICY', 'BLOG'),
    isActive: Joi.boolean(),
    search: Joi.string(),
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(20)
  })
};

module.exports = {
  idSchema,
  createContentSchema,
  updateContentSchema,
  contentStatusSchema,
  queryContentSchema
};
