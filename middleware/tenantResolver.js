import Business from '../models/Business.js';
import { errorResponse } from '../utils/apiResponse.js';

export const resolveTenant = async (req, res, next) => {
  try {
    const slug = req.params.businessSlug || req.headers['x-business-slug'];
    if (!slug) {
      return next();
    }
    const business = await Business.findOne({ slug, 'settings.isActive': true });
    if (!business) {
      return errorResponse(res, 'Business not found', 404);
    }
    req.business = business;
    next();
  } catch (error) {
    next(error);
  }
};

export const requireBusiness = async (req, res, next) => {
  try {
    if (req.user && req.user.businessId) {
      const business = await Business.findById(req.user.businessId);
      if (!business) {
        return errorResponse(res, 'Business not found', 404);
      }
      req.business = business;
      return next();
    }
    return errorResponse(res, 'No business associated with this account', 400);
  } catch (error) {
    next(error);
  }
};
