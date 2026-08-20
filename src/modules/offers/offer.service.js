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

const getAllOffers = async () => {
  return await Offer.find({}).sort({ createdAt: -1 });
};

const createBanner = async (payload) => {
  const Banner = require('./banner.model');
  const banner = new Banner(payload);
  await banner.save();
  return banner;
};

const getBanners = async () => {
  const Banner = require('./banner.model');
  return await Banner.find({}).sort({ createdAt: -1 });
};

const updateBannerStatus = async (id, status) => {
  const Banner = require('./banner.model');
  return await Banner.findByIdAndUpdate(id, { status }, { new: true });
};

const deleteBanner = async (id) => {
  const Banner = require('./banner.model');
  return await Banner.findByIdAndDelete(id);
};

module.exports = {
  createOffer,
  getActiveOffers,
  getAllOffers,
  validateAndApplyOffer,
  updateOfferStatus,
  createBanner,
  getBanners,
  updateBannerStatus,
  deleteBanner
};
