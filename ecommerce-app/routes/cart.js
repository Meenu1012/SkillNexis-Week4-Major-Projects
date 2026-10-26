
const express = require("express");
const mongoose = require("mongoose");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// View the logged-in user's cart
router.get("/", authMiddleware, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.userId }).populate(
      "items.product"
    );

    res.json(cart || { user: req.userId, items: [] });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch cart" });
  }
});

// Add a product to the cart
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        message: "Quantity must be a positive integer",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ message: "Insufficient stock" });
    }

    let cart = await Cart.findOne({ user: req.userId });

    if (!cart) {
      cart = new Cart({ user: req.userId, items: [] });
    }

    const item = cart.items.find(
      (entry) => entry.product.toString() === productId
    );

    if (item) {
      const newQuantity = item.quantity + quantity;

      if (newQuantity > product.stock) {
        return res.status(400).json({ message: "Insufficient stock" });
      }

      item.quantity = newQuantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();

    res.status(200).json({
      message: "Product added to cart",
      cart,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to add product to cart" });
  }
});

// Update a cart item's quantity
router.put("/:productId", authMiddleware, async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        message: "Quantity must be a positive integer",
      });
    }

    const cart = await Cart.findOne({ user: req.userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.find(
      (entry) => entry.product.toString() === productId
    );

    if (!item) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    const product = await Product.findById(productId);

    if (!product || quantity > product.stock) {
      return res.status(400).json({ message: "Insufficient stock" });
    }

    item.quantity = quantity;
    await cart.save();

    res.json({ message: "Cart quantity updated", cart });
  } catch (error) {
    res.status(500).json({ message: "Failed to update cart" });
  }
});

// Remove a product from the cart
router.delete("/:productId", authMiddleware, async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const cart = await Cart.findOne({ user: req.userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (entry) => entry.product.toString() !== productId
    );

    await cart.save();

    res.json({ message: "Product removed from cart", cart });
  } catch (error) {
    res.status(500).json({ message: "Failed to remove product from cart" });
  }
});

module.exports = router;
