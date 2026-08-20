const offerService = require('./offer.service');
const { sendSuccess } = require('../../utils/response');

const createOffer = async (req, res, next) => {
  try {
    const offer = await offerService.createOffer(req.body);
    return sendSuccess(res, offer, 'Offer created successfully', 201);
  } catch (error) {
    next(error);
  }
};

const getActiveOffers = async (req, res, next) => {
  try {
    const offers = await offerService.getActiveOffers();
    return sendSuccess(res, offers, 'Active offers retrieved');
  } catch (error) {
    next(error);
  }
};

const applyOffer = async (req, res, next) => {
  try {
    const { code, orderValue } = req.body;
    const result = await offerService.validateAndApplyOffer(code, orderValue);
    return sendSuccess(res, result, 'Offer applied successfully');
  } catch (error) {
    next(error);
  }
};

const updateOfferStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const offer = await offerService.updateOfferStatus(id, isActive);
    return sendSuccess(res, offer, `Offer status updated to ${isActive ? 'Active' : 'Inactive'}`);
  } catch (error) {
    next(error);
  }
};

const getPromocodes = async (req, res, next) => {
  try {
    const offers = await offerService.getAllOffers();
    return sendSuccess(res, offers, 'Promocodes retrieved');
  } catch (error) {
    next(error);
  }
};

const getSales = async (req, res, next) => {
  try {
    return sendSuccess(res, { data: [] }, 'Sales retrieved');
  } catch (error) {
    next(error);
  }
};

const getBanners = async (req, res, next) => {
  try {
    const banners = await offerService.getBanners();
    return sendSuccess(res, banners, 'Banners retrieved');
  } catch (error) {
    next(error);
  }
};

const createBanner = async (req, res, next) => {
  try {
    const banner = await offerService.createBanner(req.body);
    return sendSuccess(res, banner, 'Banner created', 201);
  } catch (error) {
    next(error);
  }
};

const updateBannerStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const banner = await offerService.updateBannerStatus(id, status);
    return sendSuccess(res, banner, 'Banner status updated');
  } catch (error) {
    next(error);
  }
};

const deleteBanner = async (req, res, next) => {
  try {
    const { id } = req.params;
    await offerService.deleteBanner(id);
    return sendSuccess(res, null, 'Banner deleted');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOffer,
  getActiveOffers,
  applyOffer,
  updateOfferStatus,
  getPromocodes,
  getSales,
  getBanners,
  createBanner,
  updateBannerStatus,
  deleteBanner
};
