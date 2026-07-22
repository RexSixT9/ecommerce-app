import { Request, Response } from "express";
import Product from "../models/product.model.js";
import { cloudinaryConfig } from "../config/cloudinary.js";

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
    let images: string[] = [];

    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const uploadPromises = req.files.map((file) => {
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
      images = await Promise.all(uploadPromises);
    }

    let sizes = req.body.sizes || [];
    if (typeof sizes === "string") {
      try {
        sizes = JSON.parse(sizes);
      } catch (error) {
        sizes = sizes
          .split(",")
          .map((size: string) => size.trim())
          .filter((size: string) => size !== "");
      }
    }

    if (!Array.isArray(sizes)) sizes = [sizes];
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
      isActive,
      isFeatured,
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
    res.status(400).json({ success: false, message: "Error creating product" });
  }
};

// Update a product by ID
// PUT /api/products/:id
export const updateProduct = async (req: Request, res: Response) => {
  try {
    let images: string[] = [];

    if (req.body.existingImages) {
      if (Array.isArray(req.body.existingImages)) {
        images = [...req.body.existingImages];
      } else {
        images = [req.body.existingImages];
      }
    }

    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const uploadPromises = req.files.map((file) => {
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
      const newImages = await Promise.all(uploadPromises);
      images = [...images, ...newImages];
    }

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
      isActive,
      isFeatured,
    };

    if (req.body.sizes) {
      let sizes = req.body.sizes;
      if (typeof sizes === "string") {
        try {
          sizes = JSON.parse(sizes);
        } catch (error) {
          sizes = sizes
            .split(",")
            .map((size: string) => size.trim())
            .filter((size: string) => size !== "");
        }
      }
      if (!Array.isArray(sizes)) sizes = [sizes];
      updates.sizes = sizes;
    }

    if (
      req.body.existingImages ||
      (req.files && Array.isArray(req.files) && req.files.length > 0)
    ) {
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
    res.status(400).json({ success: false, message: "Error updating product" });
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
