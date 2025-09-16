# Environment Configuration Guide

## Step 1: Create .env file

Create a `.env` file in the `server` directory with the following content:

```env
# Database Configuration
DB_USERNAME=hachemronaldo5
DB_PASSWORD=Hachem_RT
MONGODB_URI=mongodb+srv://hachemronaldo5:Hachem_RT@cluster0.phgcmd6.mongodb.net/ecommerce?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
JWT_EXPIRE=7d

# Server Configuration
PORT=8000
NODE_ENV=development

# Paytm Configuration
PAYTM_MERCHANT_KEY=your_paytm_merchant_key
PAYTM_MID=your_paytm_mid
PAYTM_WEBSITE=your_paytm_website
PAYTM_CHANNEL_ID=your_paytm_channel_id
PAYTM_INDUSTRY_TYPE_ID=your_paytm_industry_type_id
PAYTM_CUST_ID=your_paytm_cust_id

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=noreply@ecommerce.com

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Step 2: Configure Required Values

### ✅ Already Configured:

- **Database**: Your MongoDB cluster is already configured
- **JWT Secret**: You can use the provided one for development, but change it for production

### 🔧 Values You Need to Configure:

#### 1. JWT Secret (Required)

Replace `your_super_secret_jwt_key_here_change_this_in_production` with a strong secret key:

```bash
# Generate a strong JWT secret (run this in terminal)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### 2. Paytm Configuration (Optional for testing)

If you want to test payments, get credentials from Paytm:

- Sign up at https://business.paytm.com/
- Get your merchant credentials
- Replace the placeholder values

#### 3. Email Configuration (Optional for testing)

For email notifications, configure Gmail:

- Use your Gmail address
- Generate an App Password:
  1. Go to Google Account settings
  2. Enable 2-Factor Authentication
  3. Generate an App Password for "Mail"
  4. Use the App Password (not your regular password)

## Step 3: Quick Setup Commands

Run these commands in your terminal:

```bash
# Navigate to server directory
cd server

# Copy the example file to .env
cp env.example .env

# Edit the .env file with your preferred editor
nano .env
# or
code .env
# or
notepad .env
```

## Step 4: Minimal Configuration for Testing

If you just want to test the basic functionality, you only need to update the JWT_SECRET:

```env
JWT_SECRET=my_super_secret_jwt_key_for_development_only_12345
```

All other values can remain as placeholders for now.

## Step 5: Verify Configuration

After creating the `.env` file, test the configuration:

```bash
# Install dependencies
npm install

# Start the server
npm start
```

You should see:

```
Server is running successfully on PORT 8000
Environment: development
Database Connected Successfully
Data imported Successfully
```

## Security Notes

1. **Never commit .env files to version control**
2. **Use strong, unique JWT secrets in production**
3. **Keep your database credentials secure**
4. **Use environment-specific configurations**

## Troubleshooting

### Database Connection Issues

- Verify your MongoDB cluster is accessible
- Check if your IP is whitelisted in MongoDB Atlas
- Ensure the connection string is correct

### Email Issues

- Verify Gmail App Password is correct
- Check if 2FA is enabled on your Gmail account
- Test with a simple email first

### JWT Issues

- Ensure JWT_SECRET is set and not empty
- Use a strong secret (at least 32 characters)
- Don't use common words or phrases
