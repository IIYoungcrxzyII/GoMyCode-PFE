import Product from '../model/productSchema.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// @desc    Get all products with filtering, sorting, and pagination
// @route   GET /api/products
// @access  Public
export const getProducts = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Build filter object
    let filter = { isActive: true };
    
    if (req.query.category) {
        filter.category = req.query.category;
    }
    
    if (req.query.brand) {
        filter.brand = req.query.brand;
    }
    
    if (req.query.minPrice || req.query.maxPrice) {
        filter['price.cost'] = {};
        if (req.query.minPrice) filter['price.cost'].$gte = parseInt(req.query.minPrice);
        if (req.query.maxPrice) filter['price.cost'].$lte = parseInt(req.query.maxPrice);
    }
    
    if (req.query.search) {
        filter.$text = { $search: req.query.search };
    }
    
    if (req.query.featured) {
        filter.featured = req.query.featured === 'true';
    }

    // Build sort object
    let sort = { createdAt: -1 };
    if (req.query.sort) {
        switch (req.query.sort) {
            case 'price-low':
                sort = { 'price.cost': 1 };
                break;
            case 'price-high':
                sort = { 'price.cost': -1 };
                break;
            case 'rating':
                sort = { averageRating: -1 };
                break;
            case 'newest':
                sort = { createdAt: -1 };
                break;
            case 'oldest':
                sort = { createdAt: 1 };
                break;
        }
    }

    const products = await Product.find(filter)
        .populate('reviews.user', 'firstname lastname')
        .sort(sort)
        .skip(skip)
        .limit(limit);

    const total = await Product.countDocuments(filter);

    res.json({
        success: true,
        data: products,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    });
});

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findOne({ id: req.params.id })
        .populate('reviews.user', 'firstname lastname');

    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Product not found'
        });
    }

    res.json({
        success: true,
        data: product
    });
});

// @desc    Create new product (Admin only)
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = asyncHandler(async (req, res) => {
    const product = await Product.create(req.body);

    res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product
    });
});

// @desc    Update product (Admin only)
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = asyncHandler(async (req, res) => {
    const product = await Product.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );

    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Product not found'
        });
    }

    res.json({
        success: true,
        message: 'Product updated successfully',
        data: product
    });
});

// @desc    Delete product (Admin only)
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Product not found'
        });
    }

    res.json({
        success: true,
        message: 'Product deleted successfully'
    });
});

// @desc    Add product review
// @route   POST /api/products/:id/reviews
// @access  Private
export const addProductReview = asyncHandler(async (req, res) => {
    const { rating, comment } = req.body;
    const productId = req.params.id;

    const product = await Product.findOne({ id: productId });
    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Product not found'
        });
    }

    // Check if user already reviewed this product
    const existingReview = product.reviews.find(
        review => review.user.toString() === req.user._id.toString()
    );

    if (existingReview) {
        return res.status(400).json({
            success: false,
            message: 'You have already reviewed this product'
        });
    }

    const review = {
        user: req.user._id,
        rating,
        comment
    };

    product.reviews.push(review);
    await product.save();

    res.status(201).json({
        success: true,
        message: 'Review added successfully',
        data: product
    });
});

// @desc    Get product categories
// @route   GET /api/products/categories
// @access  Public
export const getProductCategories = asyncHandler(async (req, res) => {
    const categories = await Product.distinct('category');
    
    res.json({
        success: true,
        data: categories
    });
});

// @desc    Get product brands
// @route   GET /api/products/brands
// @access  Public
export const getProductBrands = asyncHandler(async (req, res) => {
    const brands = await Product.distinct('brand');
    
    res.json({
        success: true,
        data: brands
    });
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
export const getFeaturedProducts = asyncHandler(async (req, res) => {
    const products = await Product.find({ 
        featured: true, 
        isActive: true 
    })
    .populate('reviews.user', 'firstname lastname')
    .limit(8);

    res.json({
        success: true,
        data: products
    });
});