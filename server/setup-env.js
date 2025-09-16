#!/usr/bin/env node

import fs from "fs";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("🚀 ECommerce Environment Setup");
console.log("================================\n");

// Check if .env already exists
const envPath = path.join(__dirname, ".env");
if (fs.existsSync(envPath)) {
  console.log("⚠️  .env file already exists!");
  console.log(
    "   If you want to recreate it, delete the existing .env file first.\n"
  );
  process.exit(0);
}

// Generate a strong JWT secret
const jwtSecret = crypto.randomBytes(64).toString("hex");

// Create .env content
const envContent = `# Database Configuration
DB_USERNAME=hachemronaldo5
DB_PASSWORD=Hachem_RT
MONGODB_URI=mongodb+srv://hachemronaldo5:Hachem_RT@cluster0.phgcmd6.mongodb.net/ecommerce?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=${jwtSecret}
JWT_EXPIRE=7d

# Server Configuration
PORT=8000
NODE_ENV=development

# Paytm Configuration (Optional - replace with your credentials)
PAYTM_MERCHANT_KEY=your_paytm_merchant_key
PAYTM_MID=your_paytm_mid
PAYTM_WEBSITE=your_paytm_website
PAYTM_CHANNEL_ID=your_paytm_channel_id
PAYTM_INDUSTRY_TYPE_ID=your_paytm_industry_type_id
PAYTM_CUST_ID=your_paytm_cust_id

# Email Configuration (Optional - replace with your credentials)
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
`;

try {
  // Write .env file
  fs.writeFileSync(envPath, envContent);

  console.log("✅ .env file created successfully!");
  console.log("✅ JWT secret generated automatically");
  console.log("✅ Database connection configured");
  console.log("\n📝 Next steps:");
  console.log("   1. Review the .env file");
  console.log("   2. Update Paytm credentials if needed");
  console.log("   3. Update email credentials if needed");
  console.log("   4. Run: npm install");
  console.log("   5. Run: npm start");
  console.log("\n🔒 Security note:");
  console.log("   - Never commit .env files to version control");
  console.log("   - Keep your credentials secure");
  console.log("   - Use different secrets for production");
} catch (error) {
  console.error("❌ Error creating .env file:", error.message);
  process.exit(1);
}
