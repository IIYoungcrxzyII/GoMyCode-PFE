import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true,
        maxlength: 500
    },
    helpful: {
        type: Number,
        default: 0
    },
    isVerified: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const productSchema = new mongoose.Schema({
    id: {
        type: String,
        unique: true,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    detailUrl: String,
    title: {
        shortTitle: {
            type: String,
            required: true
        },
        longTitle: String
    },
    price: {
        mrp: {
            type: Number,
            required: true,
            min: 0
        },
        cost: {
            type: Number,
            required: true,
            min: 0
        },
        discount: {
            type: String,
            default: '0%'
        }
    },
    quantity: {
        type: Number,
        default: 1,
        min: 0
    },
    description: {
        type: String,
        required: true
    },
    discount: String,
    tagline: String,
    category: {
        type: String,
        required: true,
        index: true
    },
    subcategory: String,
    brand: String,
    specifications: [{
        name: String,
        value: String
    }],
    images: [String],
    tags: [String],
    reviews: [reviewSchema],
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    totalReviews: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    featured: {
        type: Boolean,
        default: false
    },
    stock: {
        type: Number,
        default: 0,
        min: 0
    },
    sku: String,
    weight: Number,
    dimensions: {
        length: Number,
        width: Number,
        height: Number
    }
}, {
    timestamps: true
});

// Calculate average rating before saving
productSchema.pre('save', function(next) {
    if (this.reviews && this.reviews.length > 0) {
        const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
        this.averageRating = Math.round((totalRating / this.reviews.length) * 10) / 10;
        this.totalReviews = this.reviews.length;
    }
    next();
});

// Index for search functionality
productSchema.index({ 
    'title.shortTitle': 'text', 
    'title.longTitle': 'text', 
    description: 'text',
    category: 'text',
    brand: 'text'
});

// Auto-increment functionality removed - using MongoDB ObjectId instead

const Product = mongoose.model('Product', productSchema);

export default Product;