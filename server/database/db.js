import mongoose from "mongoose";

const Connection = async () => {
  const MONGODB_URI =
    process.env.MONGODB_URI ||
    "mongodb+srv://hachemronaldo5:Hachem_RT@cluster0.phgcmd6.mongodb.net/ecommerce?retryWrites=true&w=majority";

  try {
    await mongoose.connect(MONGODB_URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log("Database Connected Successfully");
  } catch (error) {
    console.error("Database Connection Error: ", error.message);
    console.log("⚠️  Please check your MongoDB Atlas IP whitelist settings");
    console.log(
      "   Go to: https://cloud.mongodb.com/ → Network Access → IP Access List"
    );
    console.log("   Add your current IP address or 0.0.0.0/0 for development");
    // Don't exit, let the server run without database for now
    console.log(
      "   Server will continue running without database connection..."
    );
  }
};

export default Connection;
