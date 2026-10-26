
require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const readline = require("readline");
const User = require("./models/User");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()));
  });
}

async function createAdmin() {
  try {
    const name = await ask("Enter admin name: ");
    const email = (await ask("Enter admin email: ")).toLowerCase();
    const password = await ask("Enter admin password (minimum 6 characters): ");

    if (!name || !email || password.length < 6) {
      throw new Error("Enter a name, valid email, and password of at least 6 characters.");
    }

    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from .env");
    }

    await mongoose.connect(process.env.MONGO_URI);

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new Error(
        "This email already exists. Choose a different email; no account was changed."
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await User.create({
      name,
      email,
      password: hashedPassword,
      role: "admin",
    });

    console.log("\nAdmin account created successfully!");
    console.log("Email:", email);
    console.log("Role: admin");
    console.log("Now log in through your website.");
  } catch (error) {
    console.error("\nError:", error.message);
  } finally {
    rl.close();
    await mongoose.disconnect().catch(() => {});
  }
}

createAdmin();
