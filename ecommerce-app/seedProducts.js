
require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");

const products = [
  // WOMEN
  {
    name: "Women's Floral Dress",
    description: "Beautiful casual floral dress",
    price: 899,
    category: "Women",
    stock: 20,
    image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600",
  },
  {
    name: "Women's Kurti",
    description: "Comfortable everyday ethnic wear",
    price: 599,
    category: "Women",
    stock: 15,
    image: "https://images.unsplash.com/photo-1583391733956-6c78276477e8?w=600",
  },
  {
    name: "Women's Top",
    description: "Casual top for everyday wear",
    price: 499,
    category: "Women",
    stock: 18,
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600",
  },

  // MEN
  {
    name: "Men's Casual Shirt",
    description: "Stylish casual shirt",
    price: 699,
    category: "Men",
    stock: 15,
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600",
  },
  {
    name: "Men's T-Shirt",
    description: "Everyday cotton T-shirt",
    price: 399,
    category: "Men",
    stock: 25,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600",
  },
  {
    name: "Men's Jeans",
    description: "Casual denim jeans",
    price: 999,
    category: "Men",
    stock: 12,
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600",
  },

  // KIDS
  {
    name: "Kids' T-Shirt",
    description: "Comfortable everyday kids' T-shirt",
    price: 299,
    category: "Kids",
    stock: 20,
    image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600",
  },
  {
    name: "Kids' Outfit",
    description: "Cute outfit for children",
    price: 599,
    category: "Kids",
    stock: 12,
    image: "https://images.unsplash.com/photo-1503919005314-30d93d07d823?w=600",
  },

  // FOOTWEAR
  {
    name: "Casual Sneakers",
    description: "Comfortable everyday sneakers",
    price: 1299,
    category: "Footwear",
    stock: 12,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
  },
  {
    name: "Casual Sandals",
    description: "Lightweight everyday sandals",
    price: 499,
    category: "Footwear",
    stock: 20,
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600",
  },

  // BEAUTY
  {
    name: "Skincare Set",
    description: "Daily skincare essentials",
    price: 699,
    category: "Beauty",
    stock: 15,
    image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600",
  },
  {
    name: "Makeup Organizer",
    description: "Organizer for beauty essentials",
    price: 399,
    category: "Beauty",
    stock: 10,
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600",
  },

  // ACCESSORIES
  {
    name: "Women's Handbag",
    description: "Stylish handbag for daily use",
    price: 999,
    category: "Accessories",
    stock: 10,
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600",
  },
  {
    name: "Fashion Sunglasses",
    description: "Sunglasses for everyday style",
    price: 299,
    category: "Accessories",
    stock: 20,
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600",
  },

  // HOME & KITCHEN
  {
    name: "Kitchen Storage Set",
    description: "Storage containers for kitchen essentials",
    price: 499,
    category: "Home & Kitchen",
    stock: 15,
    image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=600",
  },
  {
    name: "Decorative Vase",
    description: "Decorative vase for home interiors",
    price: 599,
    category: "Home & Kitchen",
    stock: 10,
    image: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=600",
  },

  // ELECTRONICS
  {
    name: "Wireless Mouse",
    description: "Wireless mouse for work and study",
    price: 499,
    category: "Electronics",
    stock: 20,
    image: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=600",
  },
  {
    name: "USB Keyboard",
    description: "Comfortable keyboard for daily use",
    price: 799,
    category: "Electronics",
    stock: 18,
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600",
  },
  {
    name: "Smart Watch",
    description: "Smart watch for everyday use",
    price: 2499,
    category: "Electronics",
    stock: 10,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
  },
];

async function seedProducts() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from .env");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    let added = 0;
    let skipped = 0;

    for (const product of products) {
      const exists = await Product.findOne({
        name: product.name,
      });

      if (exists) {
        console.log("Skipped existing:", product.name);
        skipped++;
      } else {
        await Product.create(product);
        console.log("Added:", product.name);
        added++;
      }
    }

    console.log(`Finished! Added ${added}; skipped ${skipped}.`);
  } catch (error) {
    console.error("Error:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedProducts();
