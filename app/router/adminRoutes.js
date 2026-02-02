const express = require("express");
const router = express.Router();

const {
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controller/ProductController");

const upload = require("../helper/multerHelper");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin only product management
 */

/**
 * @swagger
 * /api/admin/products:
 *   post:
 *     summary: Create a new product (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *                 example: iPhone 15
 *               description:
 *                 type: string
 *                 example: Latest Apple smartphone
 *               price:
 *                 type: number
 *                 example: 79999
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Product created successfully
 *       401:
 *         description: Unauthorized (Token missing or invalid)
 *       403:
 *         description: Admin access only
 */
router.post(
  "/products",
  authMiddleware,
  adminMiddleware,
  upload.array("images", 5),
  createProduct
);

/**
 * @swagger
 * /api/admin/products/{id}:
 *   put:
 *     summary: Update product (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.put(
  "/products/:id",
  authMiddleware,
  adminMiddleware,
  upload.array("images", 5),
  updateProduct
);

/**
 * @swagger
 * /api/admin/products/{id}:
 *   delete:
 *     summary: Delete product (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  "/products/:id",
  authMiddleware,
  adminMiddleware,
  deleteProduct
);

module.exports = router;
