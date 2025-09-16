import Product from "./model/productSchema.js";
import { products } from "./constants/product.js";

const DefaultData = async () => {
  try {
    // Check if products already exist
    const existingProducts = await Product.countDocuments();
    if (existingProducts > 0) {
      console.log("Products already exist, skipping data import");
      return;
    }

    // Transform products to match new schema
    const transformedProducts = products.map((product) => ({
      ...product,
      category: product.category || "Electronics",
      brand: product.brand || "Generic",
      stock: product.stock || Math.floor(Math.random() * 50) + 10,
      featured: product.featured || false,
      averageRating: 0,
      totalReviews: 0,
      reviews: [],
      specifications: product.specifications || [],
      images: product.images || [product.url],
      tags: product.tags || [],
    }));

    await Product.insertMany(transformedProducts);
    console.log("Data imported Successfully");
  } catch (error) {
    console.log("Error importing data: ", error.message);
  }
};

export default DefaultData;
