const User = require("../model/User");
const bcrypt = require("bcryptjs");
const { generateAccessToken } = require("../helper/tokenHelper");

// --- REGISTER ---
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// --- LOGIN ---
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    // Hardcoded admin for Swagger testing
    const adminEmail = "trishita@gmail.com";
    const adminPassword = "123456";

    let user;
    let isAdmin = false;

    if (email === adminEmail && password === adminPassword) {
      // If admin email & password match
      user = {
        _id: "admin-id-for-testing",
        name: "Admin",
        email: adminEmail,
      };
      isAdmin = true;
    } else {
      // Normal user from DB
      user = await User.findOne({ email });
      if (!user) return res.status(401).json({ message: "Invalid credentials" });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateAccessToken({
      id: user._id,
      email: user.email,
      role: isAdmin ? "admin" : "user",
    });

    res.status(200).json({
      message: "Login successful",
      accessToken: token,
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { register, login };
