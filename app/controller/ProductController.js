// const jwt = require("jsonwebtoken");
const Product = require("../model/Product");
const slugify = require("../helper/slugHelper");


// Generate unique slug
const generateUniqueSlug = async (name, productId = null) => {
  let baseSlug = slugify(name);
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existingProduct = await Product.findOne({ slug });

    // If no product found OR it's the same product being updated
    if (!existingProduct || existingProduct._id.toString() === productId) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
};



// helper function to get user from token
// const getUserFromToken = (req) => {
//   const authHeader = req.headers.authorization;

//   if (!authHeader) {
//     throw new Error("Access token missing");
//   }

//   const token = authHeader.split(" ")[1]; // Bearer TOKEN

//   return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
// };

// Create Product
const createProduct = async (req, res) => {
  try {
    // const user = getUserFromToken(req);

    const { name, description, price } = req.body;
    if (!name || !price) {
      return res.status(400).json({ message: "Name and price are required" });
    }

    const product = await Product.create({
      name,
      description,
      price,
      slug: await generateUniqueSlug(name),
      images: req.files ? req.files.map(file => file.filename) : [],
      createdBy: req.user._id,
    });

    res.status(201).json({ message: "Product created", product });
  } catch (error) {
    res.status(401).json({
      message: error.message || "Unauthorized",
    });
  }
};


// Get All Products with Pagination
const getAllProducts = async (req, res) => {
  try {
    // Get page and limit from query, default page=1, limit=10
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Product.countDocuments(); // total products
    const products = await Product.find()
      .skip(skip)
      .limit(limit)
      .populate("createdBy", "name email");

    res.status(200).json({
      message: "Products fetched successfully",
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      count: products.length,
      products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update Product
const updateProduct = async (req, res) => {
  try {
    const user = getUserFromToken(req);

    const { id } = req.params;
    const { name, description, price } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Update name and slug if name changed
    if (name && name !== product.name) {
  product.name = name;
  product.slug = await generateUniqueSlug(name, product._id.toString());
}

    // Update other fields
    product.description = description || product.description;
    product.price = price || product.price;

    // Update images if new files uploaded
    if (req.files && req.files.length > 0) {
      product.images = req.files.map(file => file.filename);
    }

    await product.save();

    res.json({ message: "Product updated", product });
  } catch (error) {
    res.status(401).json({
      message: error.message || "Unauthorized",
    });
  }
};

// Delete Product
const deleteProduct = async (req, res) => {
  try {
    const user = getUserFromToken(req);

    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await product.deleteOne();

    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(401).json({
      message: error.message || "Unauthorized",
    });
  }
};

// Search Products
const searchProducts = async (req, res) => {
  try {
    const query = req.query.q || ""; // search term
    const page = parseInt(req.query.page) || 1; // pagination
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Search by name or description (case-insensitive)
    const searchRegex = new RegExp(query, "i");

    const total = await Product.countDocuments({
      $or: [{ name: searchRegex }, { description: searchRegex }],
    });

    const products = await Product.find({
      $or: [{ name: searchRegex }, { description: searchRegex }],
    })
      .skip(skip)
      .limit(limit)
      .populate("createdBy", "name email");

    res.status(200).json({
      message: "Products fetched successfully",
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      count: products.length,
      products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


module.exports = {
  createProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
  searchProducts,
};
