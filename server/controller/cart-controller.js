import Cart from "../model/cartSchema.js";
import Product from "../model/productSchema.js";
import { asyncHandler } from "../middleware/errorHandler.js";

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
export const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate(
    "items.product",
    "id title price url images"
  );

  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  res.json({
    success: true,
    data: cart,
  });
});

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  // Find product
  const product = await Product.findOne({ id: productId });
  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  // Check stock availability
  if (product.stock < quantity) {
    return res.status(400).json({
      success: false,
      message: "Insufficient stock",
    });
  }

  // Find or create cart
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  // Check if item already exists in cart
  const existingItem = cart.items.find(
    (item) => item.product.toString() === product._id.toString()
  );

  if (existingItem) {
    // Update quantity
    existingItem.quantity += quantity;
    if (existingItem.quantity > 10) {
      return res.status(400).json({
        success: false,
        message: "Maximum quantity per item is 10",
      });
    }
  } else {
    // Add new item
    cart.items.push({
      product: product._id,
      quantity,
      price: product.price.cost,
    });
  }

  await cart.save();

  res.json({
    success: true,
    message: "Item added to cart successfully",
    data: cart,
  });
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/update
// @access  Private
export const updateCartItem = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;

  if (quantity < 1 || quantity > 10) {
    return res.status(400).json({
      success: false,
      message: "Quantity must be between 1 and 10",
    });
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return res.status(404).json({
      success: false,
      message: "Cart not found",
    });
  }

  const item = cart.items.find((item) => item.product.toString() === productId);

  if (!item) {
    return res.status(404).json({
      success: false,
      message: "Item not found in cart",
    });
  }

  // Check stock availability
  const product = await Product.findById(productId);
  if (product.stock < quantity) {
    return res.status(400).json({
      success: false,
      message: "Insufficient stock",
    });
  }

  item.quantity = quantity;
  await cart.save();

  res.json({
    success: true,
    message: "Cart updated successfully",
    data: cart,
  });
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove
// @access  Private
export const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return res.status(404).json({
      success: false,
      message: "Cart not found",
    });
  }

  cart.items = cart.items.filter(
    (item) => item.product.toString() !== productId
  );

  await cart.save();

  res.json({
    success: true,
    message: "Item removed from cart successfully",
    data: cart,
  });
});

// @desc    Clear cart
// @route   DELETE /api/cart/clear
// @access  Private
export const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return res.status(404).json({
      success: false,
      message: "Cart not found",
    });
  }

  cart.items = [];
  await cart.save();

  res.json({
    success: true,
    message: "Cart cleared successfully",
    data: cart,
  });
});
