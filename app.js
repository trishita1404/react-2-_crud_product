const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const dbConnect = require("./app/config/dbConnect");

// Routes
const authRoutes = require("./app/router/authRoutes");
const productRoutes = require("./app/router/productRoutes");

// Swagger
const setupSwagger = require("./app/config/swaggerConfig");

dotenv.config();

const app = express();

/* ======================
   CORS CONFIG (IMPORTANT)
====================== */
app.use(
  cors({
    origin: [
      "http://localhost:5173", //(frontend render in browser)
      "http://localhost:3000",
      "http://localhost:3001",
      "https://react-2-crud-product.onrender.com",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

/* ======================
   BODY PARSERS
====================== */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ======================
   DATABASE
====================== */
dbConnect();

/* ======================
   SWAGGER
====================== */
setupSwagger(app);

/* ======================
   ROUTES
====================== */
app.get("/", (req, res) => {
  res.send("API Test Project is Running Successfully");
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

/* ======================
   404 HANDLER
====================== */
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

/* ======================
   SERVER
====================== */
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
