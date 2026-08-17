const Offer = require('./offer.model');

const createOffer = async (payload) => {
  const existing = await Offer.findOne({ code: payload.code.toUpperCase() });
  if (existing) {
    const error = new Error('Offer code already exists');
    error.statusCode = 409;
    throw error;
  }
  const offer = new Offer(payload);
  await offer.save();
  return offer;
};

const getActiveOffers = async () => {
  const now = new Date();
  return await Offer.find({
    isActive: true,
    validFrom: { $lte: now },
    validUntil: { $gte: now }
  }).sort({ createdAt: -1 });
};

const validateAndApplyOffer = async (code, orderValue) => {
  const now = new Date();
  const offer = await Offer.findOne({
    code: code.toUpperCase(),
    isActive: true,
    validFrom: { $lte: now },
    validUntil: { $gte: now }
  });

  if (!offer) {
    const error = new Error('Invalid or expired offer code');
    error.statusCode = 400;
    throw error;
  }

  if (offer.usageLimit && offer.usedCount >= offer.usageLimit) {
    const error = new Error('Offer usage limit reached');
    error.statusCode = 400;
    throw error;
  }

  if (orderValue < offer.minOrderValue) {
    const error = new Error(`Minimum order value to apply this offer is ${offer.minOrderValue}`);
    error.statusCode = 400;
    throw error;
  }

  let discount = 0;
  if (offer.type === 'FLAT') {
    discount = offer.value;
  } else if (offer.type === 'PERCENTAGE') {
    discount = (orderValue * offer.value) / 100;
  }

  if (offer.maxDiscount && discount > offer.maxDiscount) {
    discount = offer.maxDiscount;
  }

  return {
    offerId: offer._id,
    code: offer.code,
    originalValue: orderValue,
    discountAmount: discount,
    finalValue: Math.max(0, orderValue - discount)
  };
};

const updateOfferStatus = async (offerId, isActive) => {
  const offer = await Offer.findByIdAndUpdate(offerId, { isActive }, { new: true });
  if (!offer) {
    const error = new Error('Offer not found');
    error.statusCode = 404;
    throw error;
  }
  return offer;
};

module.exports = {
  createOffer,
  getActiveOffers,
  validateAndApplyOffer,
  updateOfferStatus
};
