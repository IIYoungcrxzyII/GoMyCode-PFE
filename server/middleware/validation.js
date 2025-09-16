import { body, validationResult } from 'express-validator';

export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};

export const validateUserRegistration = [
    body('firstname')
        .trim()
        .isLength({ min: 2, max: 20 })
        .withMessage('First name must be between 2 and 20 characters'),
    body('lastname')
        .trim()
        .isLength({ min: 2, max: 20 })
        .withMessage('Last name must be between 2 and 20 characters'),
    body('username')
        .trim()
        .isLength({ min: 3, max: 20 })
        .withMessage('Username must be between 3 and 20 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('phone')
        .optional()
        .isMobilePhone('en-IN')
        .withMessage('Please provide a valid phone number'),
    handleValidationErrors
];

export const validateUserLogin = [
    body('username')
        .trim()
        .notEmpty()
        .withMessage('Username is required'),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
    handleValidationErrors
];

export const validateProduct = [
    body('title.shortTitle')
        .trim()
        .notEmpty()
        .withMessage('Product short title is required'),
    body('price.mrp')
        .isNumeric()
        .isFloat({ min: 0 })
        .withMessage('MRP must be a positive number'),
    body('price.cost')
        .isNumeric()
        .isFloat({ min: 0 })
        .withMessage('Cost must be a positive number'),
    body('description')
        .trim()
        .notEmpty()
        .withMessage('Product description is required'),
    body('category')
        .trim()
        .notEmpty()
        .withMessage('Product category is required'),
    handleValidationErrors
];

export const validateReview = [
    body('rating')
        .isInt({ min: 1, max: 5 })
        .withMessage('Rating must be between 1 and 5'),
    body('comment')
        .trim()
        .isLength({ min: 10, max: 500 })
        .withMessage('Comment must be between 10 and 500 characters'),
    handleValidationErrors
];

export const validateOrder = [
    body('shippingAddress.firstName')
        .trim()
        .notEmpty()
        .withMessage('First name is required'),
    body('shippingAddress.lastName')
        .trim()
        .notEmpty()
        .withMessage('Last name is required'),
    body('shippingAddress.address')
        .trim()
        .notEmpty()
        .withMessage('Address is required'),
    body('shippingAddress.city')
        .trim()
        .notEmpty()
        .withMessage('City is required'),
    body('shippingAddress.state')
        .trim()
        .notEmpty()
        .withMessage('State is required'),
    body('shippingAddress.zipCode')
        .trim()
        .notEmpty()
        .withMessage('ZIP code is required'),
    body('shippingAddress.country')
        .trim()
        .notEmpty()
        .withMessage('Country is required'),
    body('paymentMethod')
        .isIn(['paytm', 'cod', 'card', 'upi'])
        .withMessage('Invalid payment method'),
    handleValidationErrors
];
