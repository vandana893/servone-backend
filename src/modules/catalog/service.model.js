const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  subcategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subcategory', required: true },
  name: { type: String, required: true },
  description: String,
  
  serviceType: { type: String, enum: ['Instant', 'Scheduled', 'Request-based'], default: 'Scheduled' },
  pricingModel: { type: String, enum: ['Fixed', 'Starting From', 'Per Hour', 'Per Visit', 'Per Unit', 'Quote'], required: true },
  price: { type: Number }, // Base price if applicable
  
  estimatedDuration: String, // e.g. "2 hours"
  providerType: { type: String, enum: ['Individual professional', 'Local business', 'Field professional', 'Equipment owner', 'Local worker/team', 'Authorized partner', 'Any'], default: 'Any' },
  
  // New fields from PDF Master Data
  variants: [{ name: String, price: Number, description: String }],
  requiredDocuments: [String],
  supportedLanguages: [String],
  serviceAreaRadius: { type: Number, default: 10 }, // in km
  averageRating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  
  requiresMaterial: { type: Boolean, default: false },
  materialsIncluded: [String],
  materialsExcluded: [String],
  
  additionalCharges: [String],
  cancellationPolicy: String,
  warranty: String,
  
  photos: [String],
  
  isEmergencyAvailable: { type: Boolean, default: false },
  isHomeVisitAvailable: { type: Boolean, default: true },
  
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Strong service duplicate protection at DB level
serviceSchema.index({ categoryId: 1, subcategoryId: 1, name: 1 }, { unique: true });

// Additional query performance indexes
serviceSchema.index({ categoryId: 1 });
serviceSchema.index({ subcategoryId: 1 });
serviceSchema.index({ isActive: 1 });

module.exports = mongoose.model('Service', serviceSchema);
