import { Request, Response } from "express";
import Product from "../models/product.model.js";
import { cloudinaryConfig } from "../config/cloudinary.js";

const parseBooleanField = (value: unknown, fallback = false) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.toLowerCase() === "true";
  return fallback;
};

const parseOptionalBooleanField = (value: unknown) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  return parseBooleanField(value);
};

const parseStringArrayField = (value: unknown) => {
  if (Array.isArray(value)) {
    return value
      .flatMap((entry) =>
        typeof entry === "string"
          ? entry.split(",").map((item) => item.trim())
          : [],
      )
      .filter(Boolean);
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean);
      }
    } catch {
      // Fall through to comma-separated parsing.
    }

    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const uploadFilesToCloudinary = async (files: Express.Multer.File[]) => {
  if (!files.length) return [];

  const uploadPromises = files.map((file) => {
    return new Promise<string>((resolve, reject) => {
      const uploadStream = cloudinaryConfig.uploader.upload_stream(
        { folder: "ecom/products" },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result!.secure_url);
          }
        },
      );

      uploadStream.end(file.buffer);
    });
  });

  return await Promise.all(uploadPromises);
};

// Get all products with pagination
// GET /api/products?page=1&limit=10
export const getProducts = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, showAll } = req.query;
    const query: any = showAll === "true" ? {} : { isActive: true };

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({
      success: true,
      data: products,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching products" });
  }
};

// Get a single product by ID
// GET /api/products/:id
export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, data: product });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Error fetching product" });
  }
};

// Create a new product
// POST /api/products
export const createProduct = async (req: Request, res: Response) => {
  try {
    const files = Array.isArray(req.files) ? req.files : [];
    const images = await uploadFilesToCloudinary(files);
    const sizes = parseStringArrayField(req.body.sizes);
    const {
      name,
      description,
      price,
      category,
      comparePrice,
      stock,
      isActive,
      isFeatured,
    } = req.body;

    const productData = {
      name,
      description,
      price,
      category,
      comparePrice,
      stock,
      isActive: parseBooleanField(isActive, true),
      isFeatured: parseBooleanField(isFeatured, false),
      images,
      sizes,
    };

    if (images.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one image is required for the product",
      });
    }

    const product = await Product.create(productData);

    res.status(201).json({ success: true, data: product });
  } catch (error: any) {
    console.error("Error creating product:", error);
    const statusCode =
      error?.name === "ValidationError" || error?.name === "CastError" ? 400 : 500;
    res.status(statusCode).json({
      success: false,
      message: error?.message || "Error creating product",
    });
  }
};

// Update a product by ID
// PUT /api/products/:id
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const existingImages = parseStringArrayField(req.body.existingImages);
    const files = Array.isArray(req.files) ? req.files : [];
    const newImages = await uploadFilesToCloudinary(files);
    const images = [...existingImages, ...newImages];

    const {
      name,
      description,
      price,
      category,
      comparePrice,
      stock,
      isActive,
      isFeatured,
    } = req.body;

    const updates: Record<string, any> = {
      name,
      description,
      price,
      category,
      comparePrice,
      stock,
    };

    const parsedIsActive = parseOptionalBooleanField(isActive);
    const parsedIsFeatured = parseOptionalBooleanField(isFeatured);
    if (parsedIsActive !== undefined) {
      updates.isActive = parsedIsActive;
    }
    if (parsedIsFeatured !== undefined) {
      updates.isFeatured = parsedIsFeatured;
    }

    if (req.body.sizes !== undefined) {
      updates.sizes = parseStringArrayField(req.body.sizes);
    }

    if (req.body.existingImages !== undefined || files.length > 0) {
      updates.images = images;
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updates, {
      returnDocument: "after",
      runValidators: true,
    });
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, data: product });
  } catch (error: any) {
    console.error("Error updating product:", error);
    const statusCode =
      error?.name === "ValidationError" || error?.name === "CastError" ? 400 : 500;
    res.status(statusCode).json({
      success: false,
      message: error?.message || "Error updating product",
    });
  }
};

// Delete a product by ID
// DELETE /api/products/:id
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    if (product.images && product.images.length > 0) {
      const deletePromises = product.images.map((imageUrl) => {
        return new Promise((resolve, reject) => {
          const publicIdMatch = imageUrl.match(
            /\/upload\/(?:.*\/)?v\d+\/(.+)\.[a-zA-Z0-9]+$/,
          );
          const publicId = publicIdMatch ? publicIdMatch[1] : null;
          if (publicId) {
            cloudinaryConfig.uploader.destroy(publicId, (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            });
          } else {
            resolve(null);
          }
        });
      });
      await Promise.all(deletePromises);
    }

    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Error deleting product" });
  }
};
