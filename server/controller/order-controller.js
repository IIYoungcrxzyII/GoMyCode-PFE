import Order from "../model/orderSchema.js";
import Cart from "../model/cartSchema.js";
import Product from "../model/productSchema.js";
import {
  sendOrderConfirmationEmail,
  sendOrderShippedEmail,
} from "../services/emailService.js";
import { asyncHandler } from "../middleware/errorHandler.js";

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod } = req.body;

  // Get user's cart
  const cart = await Cart.findOne({ user: req.user._id }).populate(
    "items.product"
  );

  if (!cart || cart.items.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Cart is empty",
    });
  }

  // Check stock availability and prepare order items
  const orderItems = [];
  for (const cartItem of cart.items) {
    const product = cartItem.product;

    if (product.stock < cartItem.quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock for ${product.title.shortTitle}`,
      });
    }

    orderItems.push({
      product: product._id,
      quantity: cartItem.quantity,
      price: cartItem.price,
      name: product.title.shortTitle,
      image: product.url,
    });
  }

  // Calculate totals
  const subtotal = cart.totalAmount;
  const shippingCost = subtotal > 1000 ? 0 : 50; // Free shipping above ₹1000
  const tax = Math.round(subtotal * 0.18); // 18% GST
  const totalAmount = subtotal + shippingCost + tax;

  // Create order
  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    paymentMethod,
    subtotal,
    shippingCost,
    tax,
    totalAmount,
  });

  // Update product stock
  for (const cartItem of cart.items) {
    await Product.findByIdAndUpdate(cartItem.product._id, {
      $inc: { stock: -cartItem.quantity },
    });
  }

  // Clear cart
  cart.items = [];
  await cart.save();

  // Send confirmation email
  await sendOrderConfirmationEmail(req.user, order);

  res.status(201).json({
    success: true,
    message: "Order created successfully",
    data: order,
  });
});

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
export const getUserOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const orders = await Order.find({ user: req.user._id })
    .populate("items.product", "id title url")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Order.countDocuments({ user: req.user._id });

  res.json({
    success: true,
    data: orders,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("items.product", "id title url images")
    .populate("user", "firstname lastname email");

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found",
    });
  }

  // Check if user owns this order or is admin
  if (
    order.user._id.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to access this order",
    });
  }

  res.json({
    success: true,
    data: order,
  });
});

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus, trackingNumber } = req.body;

  const order = await Order.findById(req.params.id).populate("user");

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found",
    });
  }

  order.orderStatus = orderStatus;
  if (trackingNumber) {
    order.trackingNumber = trackingNumber;
  }

  await order.save();

  // Send email notification for status changes
  if (orderStatus === "shipped") {
    await sendOrderShippedEmail(order.user, order);
  }

  res.json({
    success: true,
    message: "Order status updated successfully",
    data: order,
  });
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = asyncHandler(async (req, res) => {
  const { cancellationReason } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found",
    });
  }

  // Check if user owns this order
  if (order.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to cancel this order",
    });
  }

  // Check if order can be cancelled
  if (["delivered", "cancelled"].includes(order.orderStatus)) {
    return res.status(400).json({
      success: false,
      message: "Order cannot be cancelled",
    });
  }

  order.orderStatus = "cancelled";
  order.cancellationReason = cancellationReason;

  // Restore product stock
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity },
    });
  }

  await order.save();

  res.json({
    success: true,
    message: "Order cancelled successfully",
    data: order,
  });
});

// @desc    Get all orders (Admin only)
// @route   GET /api/orders/admin/all
// @access  Private/Admin
export const getAllOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  let filter = {};
  if (req.query.status) {
    filter.orderStatus = req.query.status;
  }
  if (req.query.paymentStatus) {
    filter.paymentStatus = req.query.paymentStatus;
  }

  const orders = await Order.find(filter)
    .populate("user", "firstname lastname email")
    .populate("items.product", "id title")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Order.countDocuments(filter);

  res.json({
    success: true,
    data: orders,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

// @desc    Get order statistics (Admin only)
// @route   GET /api/orders/admin/stats
// @access  Private/Admin
export const getOrderStats = asyncHandler(async (req, res) => {
  const totalOrders = await Order.countDocuments();
  const totalRevenue = await Order.aggregate([
    { $match: { paymentStatus: "paid" } },
    { $group: { _id: null, total: { $sum: "$totalAmount" } } },
  ]);

  const ordersByStatus = await Order.aggregate([
    { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
  ]);

  const monthlyRevenue = await Order.aggregate([
    { $match: { paymentStatus: "paid" } },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        revenue: { $sum: "$totalAmount" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": -1, "_id.month": -1 } },
    { $limit: 12 },
  ]);

  res.json({
    success: true,
    data: {
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      ordersByStatus,
      monthlyRevenue,
    },
  });
});
