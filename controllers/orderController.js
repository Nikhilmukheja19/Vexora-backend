import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Notification from "../models/Notification.js";
import Business from "../models/Business.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

export const createOrder = async (req, res, next) => {
  try {
    const {
      items,
      shippingAddress,
      paymentMethod = "cod",
      notes,
      businessSlug,
    } = req.body;

    const business = await Business.findOne({ slug: businessSlug });
    if (!business) return errorResponse(res, "Business not found", 404);

    if (!items || items.length === 0) {
      return errorResponse(res, "No items in order", 400);
    }

    // Validate and enrich items
    let subtotal = 0;
    const orderItems = [];
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product)
        return errorResponse(res, `Product not found: ${item.product}`, 404);
      if (!product.isActive)
        return errorResponse(res, `Product unavailable: ${product.name}`, 400);

      const orderItem = {
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.images[0] || "",
      };
      subtotal += product.price * item.quantity;
      orderItems.push(orderItem);
    }

    const tax = subtotal * (business.settings.taxRate / 100);
    const shippingFee = business.settings.shippingFee || 0;
    const total = subtotal + tax + shippingFee;

    const order = await Order.create({
      customer: req.user._id,
      onModel: req.userModel,
      businessId: business._id,
      items: orderItems,
      subtotal,
      tax,
      shippingFee,
      total,
      status: "pending",
      paymentStatus: paymentMethod === "cod" ? "pending" : "pending",
      paymentMethod,
      shippingAddress,
      notes,
    });

    // Create notification for business owner
    await Notification.create({
      type: "order",
      title: "New Order Received",
      message: `Order #${order.orderNumber} placed for ₹${total.toFixed(2)}`,
      userId: business.owner,
      businessId: business._id,
      link: `/dashboard/orders/${order._id}`,
    });

    successResponse(res, { order }, "Order placed successfully", 201);
  } catch (error) {
    next(error);
  }
};

export const getOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, sort = "-createdAt" } = req.query;
    const query = { businessId: req.user.businessId };
    if (status && status !== "all") query.status = status;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate("customer", "name email phone")
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    successResponse(res, {
      orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      businessId: req.user.businessId,
    }).populate("customer", "name email phone");
    if (!order) return errorResponse(res, "Order not found", 404);
    successResponse(res, { order });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, paymentStatus } = req.body;
    const update = {};
    if (status) update.status = status;
    if (paymentStatus) update.paymentStatus = paymentStatus;

    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, businessId: req.user.businessId },
      update,
      { new: true },
    ).populate("customer", "name email");

    if (!order) return errorResponse(res, "Order not found", 404);

    // Notify customer
    if (order.customer) {
      await Notification.create({
        type: "order",
        title: "Order Updated",
        message: `Your order #${order.orderNumber} status: ${status || order.status}`,
        userId: order.customer._id || order.customer,
        onModel: order.onModel,
        link: `/orders/${order._id}`,
      });
    }

    successResponse(res, { order }, "Order updated");
  } catch (error) {
    next(error);
  }
};

export const getCustomerOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, businessSlug } = req.query;
    const query = { customer: req.user._id };

    if (businessSlug) {
      const business = await Business.findOne({ slug: businessSlug });
      if (business) {
        query.businessId = business._id;
      }
    }

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate("businessId", "name slug")
      .sort("-createdAt")
      .skip((page - 1) * limit)
      .limit(Number(limit));

    successResponse(res, {
      orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderAnalytics = async (req, res, next) => {
  try {
    const businessId = req.user.businessId;
    const now = new Date();

    // Monthly revenue for last 12 months
    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          businessId,
          createdAt: {
            $gte: new Date(now.getFullYear(), now.getMonth() - 11, 1),
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          revenue: { $sum: "$total" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Order status distribution
    const statusDistribution = await Order.aggregate([
      { $match: { businessId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // Top products
    const topProducts = await Order.aggregate([
      { $match: { businessId } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.name",
          totalSold: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
    ]);

    successResponse(res, { monthlyRevenue, statusDistribution, topProducts });
  } catch (error) {
    next(error);
  }
};
