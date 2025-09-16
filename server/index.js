import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import { v4 as uuid } from "uuid";

import Connection from "./database/db.js";
import DefaultData from "./default.js";
import Routes from "./routes/route.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { generalLimiter } from "./middleware/rateLimiter.js";

dotenv.config();
const app = express();

const PORT = process.env.PORT || 8000;

// Connect to database
Connection();

// Security middleware
app.use(helmet());
app.use(generalLimiter);

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Body parsing middleware
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

// Routes
app.use("/api", Routes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running successfully on PORT ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});

// Initialize default data
DefaultData();

// Paytm configuration
export let paytmMerchantkey = process.env.PAYTM_MERCHANT_KEY;
export let paytmParams = {};
paytmParams["MID"] = process.env.PAYTM_MID;
paytmParams["WEBSITE"] = process.env.PAYTM_WEBSITE;
paytmParams["CHANNEL_ID"] = process.env.PAYTM_CHANNEL_ID;
paytmParams["INDUSTRY_TYPE_ID"] = process.env.PAYTM_INDUSTRY_TYPE_ID;
paytmParams["ORDER_ID"] = uuid();
paytmParams["CUST_ID"] = process.env.PAYTM_CUST_ID;
paytmParams["TXN_AMOUNT"] = "100";
paytmParams["CALLBACK_URL"] = `${
  process.env.FRONTEND_URL || "http://localhost:8000"
}/callback`;
paytmParams["EMAIL"] = "kunaltyagi@gmail.com";
paytmParams["MOBILE_NO"] = "1234567852";
