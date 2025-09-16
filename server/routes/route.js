import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addProductReview,
  getProductCategories,
  getProductBrands,
  getFeaturedProducts,
} from "../controller/product-controller.js";
import {
  userSignUp,
  userLogIn,
  getUserProfile,
  updateUserProfile,
  changePassword,
  forgotPassword,
  getAllUsers,
  deleteUser,
} from "../controller/user-controller.js";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../controller/cart-controller.js";
import {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getAllOrders,
  getOrderStats,
} from "../controller/order-controller.js";
import {
  addPaymentGateway,
  paymentResponse,
} from "../controller/payment-controller.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";
import { authLimiter, paymentLimiter } from "../middleware/rateLimiter.js";
import {
  validateUserRegistration,
  validateUserLogin,
  validateProduct,
  validateReview,
  validateOrder,
} from "../middleware/validation.js";

const router = express.Router();

// Public routes
router.get("/products", getProducts);
router.get("/products/featured", getFeaturedProducts);
router.get("/products/categories", getProductCategories);
router.get("/products/brands", getProductBrands);
router.get("/products/:id", getProductById);

// Auth routes
router.post("/users/signup", authLimiter, validateUserRegistration, userSignUp);
router.post("/users/login", authLimiter, validateUserLogin, userLogIn);
router.post("/users/forgot-password", authLimiter, forgotPassword);

// Protected routes
router.use(authenticateToken);

// User routes
router.get("/users/profile", getUserProfile);
router.put("/users/profile", updateUserProfile);
router.put("/users/change-password", changePassword);

// Cart routes
router.get("/cart", getCart);
router.post("/cart/add", addToCart);
router.put("/cart/update", updateCartItem);
router.delete("/cart/remove", removeFromCart);
router.delete("/cart/clear", clearCart);

// Order routes
router.post("/orders", validateOrder, createOrder);
router.get("/orders", getUserOrders);
router.get("/orders/:id", getOrderById);
router.put("/orders/:id/cancel", cancelOrder);

// Product review routes
router.post("/products/:id/reviews", validateReview, addProductReview);

// Payment routes
router.post("/payment", paymentLimiter, addPaymentGateway);
router.post("/callback", paymentResponse);

// Admin routes
router.use(requireAdmin);

// Admin product routes
router.post("/products", validateProduct, createProduct);
router.put("/products/:id", validateProduct, updateProduct);
router.delete("/products/:id", deleteProduct);

// Admin user routes
router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);

// Admin order routes
router.get("/orders/admin/all", getAllOrders);
router.get("/orders/admin/stats", getOrderStats);
router.put("/orders/:id/status", updateOrderStatus);

export default router;
