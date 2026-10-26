const express = require("express");
const mongoose = require("mongoose");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const authMiddleware = require("../middleware/auth");
const adminMiddleware = require("../middleware/admin");

const router = express.Router();

const allowedStatuses = [
  "Placed",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

// Place an order (Checkout)
router.post("/checkout", authMiddleware, async (req, res) => {
  try {
    const { shippingAddress } = req.body;

    if (
      typeof shippingAddress !== "string" ||
      !shippingAddress.trim()
    ) {
      return res.status(400).json({
        message: "Shipping address is required",
      });
    }

    const cart = await Cart.findOne({ user: req.userId });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        message: "Your cart is empty",
      });
    }

    const orderItems = [];
    let totalAmount = 0;

    // Validate every product and its current stock.
    for (const item of cart.items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(400).json({
          message: "A product in your cart no longer exists",
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}`,
        });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
      });

      totalAmount += product.price * item.quantity;
    }

    // Deduct stock only when enough stock remains.
    const deductedItems = [];

    for (const item of cart.items) {
      const result = await Product.updateOne(
        {
          _id: item.product,
          stock: { $gte: item.quantity },
        },
        {
          $inc: { stock: -item.quantity },
        }
      );

      if (result.modifiedCount !== 1) {
        // Restore stock deducted earlier in this checkout.
        for (const deducted of deductedItems) {
          await Product.updateOne(
            { _id: deducted.product },
            { $inc: { stock: deducted.quantity } }
          );
        }

        return res.status(409).json({
          message: "Stock changed. Please review your cart and try again",
        });
      }

      deductedItems.push({
        product: item.product,
        quantity: item.quantity,
      });
    }

    let order;

    try {
      order = await Order.create({
        user: req.userId,
        items: orderItems,
        totalAmount: Number(totalAmount.toFixed(2)),
        shippingAddress: shippingAddress.trim(),
        paymentMethod: "COD",
      });
    } catch (error) {
      // Restore stock if order creation fails.
      for (const deducted of deductedItems) {
        await Product.updateOne(
          { _id: deducted.product },
          { $inc: { stock: deducted.quantity } }
        );
      }

      throw error;
    }

    await Cart.deleteOne({ user: req.userId });

    return res.status(201).json({
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    console.error("Checkout failed:", error.message);

    return res.status(500).json({
      message: "Checkout failed. Please try again",
    });
  }
});

// ADMIN: Get all customer orders.
// Keep this route before GET /:id.
router.get(
  "/admin/all",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const orders = await Order.find()
        .populate("user", "name email")
        .sort({ createdAt: -1 });

      return res.json(orders);
    } catch (error) {
      console.error("Admin order fetch failed:", error.message);

      return res.status(500).json({
        message: "Failed to fetch all orders",
      });
    }
  }
);

// ADMIN: Update an order's status.
router.patch(
  "/admin/:id/status",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
          message: "Invalid order ID",
        });
      }

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          message: "Invalid order status",
          allowedStatuses,
        });
      }

      const order = await Order.findByIdAndUpdate(
        id,
        { $set: { status } },
        { new: true, runValidators: true }
      ).populate("user", "name email");

      if (!order) {
        return res.status(404).json({
          message: "Order not found",
        });
      }

      return res.json({
        message: "Order status updated successfully",
        order,
      });
    } catch (error) {
      console.error("Order status update failed:", error.message);

      return res.status(500).json({
        message: "Failed to update order status",
      });
    }
  }
);

// CUSTOMER: Get the logged-in customer's order history.
router.get("/", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId })
      .sort({ createdAt: -1 });

    return res.json(orders);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch orders",
    });
  }
});

// CUSTOMER: Get one of the logged-in customer's orders.
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid order ID",
      });
    }

    const order = await Order.findOne({
      _id: req.params.id,
      user: req.userId,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    return res.json(order);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch order",
    });
  }
});

module.exports = router;