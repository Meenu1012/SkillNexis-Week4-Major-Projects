
const mongoose = require("mongoose");
require("dotenv").config();

const User = require("../models/User");

async function makeAdmin() {
  try {
    const email = process.argv[2];

    if (!email) {
      console.log("Usage: node scripts/makeAdmin.js user@example.com");
      process.exitCode = 1;
      return;
    }

    await mongoose.connect(process.env.MONGO_URI);

    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      { role: "admin" },
      { new: true, runValidators: true }
    );

    if (!user) {
      console.log("User not found. Register that user first.");
      return;
    }

    console.log(`Admin role assigned to ${user.email}`);
  } catch (error) {
    console.error("Admin setup failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

makeAdmin();
