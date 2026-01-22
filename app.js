const express = require("express");
const dotenv = require("dotenv");
const dbConnect = require("./app/config/dbConnect");

// Routes
const authRoutes = require("./app/router/authRoutes");
const productRoutes = require("./app/router/productRoutes");


const setupSwagger = require("./app/config/swaggerConfig");

dotenv.config();

const app = express();

setupSwagger(app);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection
dbConnect();

// Test Root Route
app.get("/", (req, res) => {
  res.send("API Test Project is Running Successfully");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Start Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
