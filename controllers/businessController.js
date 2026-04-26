import Business from '../models/Business.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Customer from '../models/Customer.js';
import Ticket from '../models/Ticket.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const getBusinessProfile = async (req, res, next) => {
  try {
    const business = await Business.findById(req.user.businessId).populate('owner', 'name email');
    if (!business) return errorResponse(res, 'Business not found', 404);
    successResponse(res, { business });
  } catch (error) {
    next(error);
  }
};

export const updateBusiness = async (req, res, next) => {
  try {
    const { 
      name, description, category, contactEmail, contactPhone, 
      address, theme, settings, socialLinks 
    } = req.body;
    
    const business = await Business.findByIdAndUpdate(
      req.user.businessId,
      { 
        $set: { 
          name, description, category, contactEmail, contactPhone, 
          address, theme, settings, socialLinks 
        } 
      },
      { new: true, runValidators: true }
    );
    if (!business) return errorResponse(res, 'Business not found', 404);
    successResponse(res, { business }, 'Business updated');
  } catch (error) {
    next(error);
  }
};

export const getDashboardStats = async (req, res, next) => {
  try {
    const businessId = req.user.businessId;
    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now - 60 * 24 * 60 * 60 * 1000);

    const [totalOrders, totalProducts, totalCustomers, totalTickets, recentOrders, previousOrders, revenue, previousRevenue] = await Promise.all([
      Order.countDocuments({ businessId }),
      Product.countDocuments({ businessId }),
      Customer.countDocuments({ businessId }),
      Ticket.countDocuments({ businessId }),
      Order.countDocuments({ businessId, createdAt: { $gte: thirtyDaysAgo } }),
      Order.countDocuments({ businessId, createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } }),
      Order.aggregate([
        { $match: { businessId: businessId, paymentStatus: 'paid', createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Order.aggregate([
        { $match: { businessId: businessId, paymentStatus: 'paid', createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
    ]);

    const currentRevenue = revenue[0]?.total || 0;
    const prevRevenue = previousRevenue[0]?.total || 0;
    const revenueChange = prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue * 100).toFixed(1) : 0;
    const orderChange = previousOrders > 0 ? ((recentOrders - previousOrders) / previousOrders * 100).toFixed(1) : 0;

    // Sales chart data (last 7 days)
    const salesData = await Order.aggregate([
      { $match: { businessId: businessId, createdAt: { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          orders: { $sum: 1 },
          revenue: { $sum: '$total' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Recent orders
    const latestOrders = await Order.find({ businessId })
      .populate('customer', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    successResponse(res, {
      stats: {
        totalOrders,
        totalProducts,
        totalCustomers,
        totalTickets,
        revenue: currentRevenue,
        revenueChange: Number(revenueChange),
        orderChange: Number(orderChange),
      },
      salesData,
      latestOrders,
    });
  } catch (error) {
    next(error);
  }
};

export const getBusinessBySlug = async (req, res, next) => {
  try {
    const business = await Business.findOne({ slug: req.params.slug, 'settings.isActive': true })
      .select('-settings -__v');
    if (!business) return errorResponse(res, 'Business not found', 404);
    successResponse(res, { business });
  } catch (error) {
    next(error);
  }
};
