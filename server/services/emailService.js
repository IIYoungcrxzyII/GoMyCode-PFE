import nodemailer from 'nodemailer';

const createTransporter = () => {
    return nodemailer.createTransporter({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

export const sendWelcomeEmail = async (user) => {
    try {
        const transporter = createTransporter();
        
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: user.email,
            subject: 'Welcome to ECommerce Store!',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2874f0;">Welcome to ECommerce Store!</h2>
                    <p>Hello ${user.firstname} ${user.lastname},</p>
                    <p>Thank you for registering with us. We're excited to have you on board!</p>
                    <p>You can now start shopping and enjoy our amazing products.</p>
                    <p>Happy Shopping!</p>
                    <br>
                    <p>Best regards,<br>ECommerce Team</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('Welcome email sent successfully');
    } catch (error) {
        console.error('Error sending welcome email:', error);
    }
};

export const sendOrderConfirmationEmail = async (user, order) => {
    try {
        const transporter = createTransporter();
        
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: user.email,
            subject: `Order Confirmation - ${order.orderNumber}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2874f0;">Order Confirmed!</h2>
                    <p>Hello ${user.firstname},</p>
                    <p>Your order has been confirmed and is being processed.</p>
                    <p><strong>Order Number:</strong> ${order.orderNumber}</p>
                    <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
                    <p><strong>Order Status:</strong> ${order.orderStatus}</p>
                    <p>We'll send you another email when your order ships.</p>
                    <p>Thank you for shopping with us!</p>
                    <br>
                    <p>Best regards,<br>ECommerce Team</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('Order confirmation email sent successfully');
    } catch (error) {
        console.error('Error sending order confirmation email:', error);
    }
};

export const sendOrderShippedEmail = async (user, order) => {
    try {
        const transporter = createTransporter();
        
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: user.email,
            subject: `Your Order Has Shipped - ${order.orderNumber}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2874f0;">Your Order Has Shipped!</h2>
                    <p>Hello ${user.firstname},</p>
                    <p>Great news! Your order has been shipped and is on its way to you.</p>
                    <p><strong>Order Number:</strong> ${order.orderNumber}</p>
                    <p><strong>Tracking Number:</strong> ${order.trackingNumber || 'Will be updated soon'}</p>
                    <p>You can track your order using the tracking number above.</p>
                    <p>Thank you for shopping with us!</p>
                    <br>
                    <p>Best regards,<br>ECommerce Team</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('Order shipped email sent successfully');
    } catch (error) {
        console.error('Error sending order shipped email:', error);
    }
};

export const sendPasswordResetEmail = async (user, resetToken) => {
    try {
        const transporter = createTransporter();
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
        
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: user.email,
            subject: 'Password Reset Request',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2874f0;">Password Reset Request</h2>
                    <p>Hello ${user.firstname},</p>
                    <p>You requested to reset your password. Click the link below to reset it:</p>
                    <a href="${resetUrl}" style="background-color: #2874f0; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
                    <p>This link will expire in 1 hour.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                    <br>
                    <p>Best regards,<br>ECommerce Team</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('Password reset email sent successfully');
    } catch (error) {
        console.error('Error sending password reset email:', error);
    }
};
