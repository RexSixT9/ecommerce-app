import { Request, Response } from "express";
import Banner from "../models/banner.model.js";
import { getCloudinary } from "../config/cloudinary.js";

const uploadImageToCloudinary = (file: Express.Multer.File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = getCloudinary().uploader.upload_stream(
      { folder: "ecom/banners" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result!.secure_url);
      },
    );
    uploadStream.end(file.buffer);
  });
};

const deleteImageFromCloudinary = async (imageUrl: string) => {
  const publicIdMatch = imageUrl.match(
    /\/upload\/(?:.*\/)?v\d+\/(.+)\.[a-zA-Z0-9]+$/,
  );
  const publicId = publicIdMatch ? publicIdMatch[1] : null;
  if (publicId) {
    await getCloudinary().uploader.destroy(publicId);
  }
};

export const getBanners = async (req: Request, res: Response) => {
  try {
    const { showAll } = req.query;

    if (showAll === "true") {
      const banners = await Banner.find().sort({ order: 1 });
      return res.json({ success: true, data: banners });
    }

    const now = new Date();
    const query: Record<string, any> = { isActive: true };

    query.$and = [
      {
        $or: [
          { startDate: { $exists: false } },
          { startDate: null },
          { startDate: { $lte: now } },
        ],
      },
      {
        $or: [
          { endDate: { $exists: false } },
          { endDate: null },
          { endDate: { $gte: now } },
        ],
      },
    ];

    const banners = await Banner.find(query).sort({ order: 1 });

    res.json({ success: true, data: banners });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Error fetching banners" });
  }
};

export const getBannerById = async (req: Request, res: Response) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ success: false, message: "Banner not found" });
    }
    res.json({ success: true, data: banner });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Error fetching banner" });
  }
};

export const createBanner = async (req: Request, res: Response) => {
  try {
    const count = await Banner.countDocuments();
    if (count >= 5) {
      return res.status(400).json({
        success: false,
        message: "Maximum 5 banners allowed. Delete an existing banner first.",
      });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({
        success: false,
        message: "Banner image is required.",
      });
    }

    const image = await uploadImageToCloudinary(file);
    const { title, subtitle, link, isActive, order, startDate, endDate } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Banner title is required.",
      });
    }

    const orderValue = order !== undefined ? Number(order) : count + 1;

    if (order !== undefined) {
      const existingBanner = await Banner.findOne({ order: orderValue });
      if (existingBanner) {
        return res.status(400).json({
          success: false,
          message: `Order ${orderValue} is already taken by another banner. Please choose a different order.`,
        });
      }
    }

    const bannerData: Record<string, any> = {
      image,
      title: title.trim(),
      subtitle: subtitle?.trim(),
      link,
      isActive: isActive === undefined ? true : isActive === "true" || isActive === true,
      order: orderValue,
    };

    if (startDate) {
      const parsed = new Date(startDate);
      if (isNaN(parsed.getTime())) {
        return res.status(400).json({ success: false, message: "Invalid start date format." });
      }
      bannerData.startDate = parsed;
    }
    if (endDate) {
      const parsed = new Date(endDate);
      if (isNaN(parsed.getTime())) {
        return res.status(400).json({ success: false, message: "Invalid end date format." });
      }
      bannerData.endDate = parsed;
    }

    const banner = await Banner.create(bannerData);

    res.status(201).json({ success: true, data: banner });
  } catch (error: any) {
    console.error("Error creating banner:", error);
    const statusCode =
      error?.name === "ValidationError" || error?.name === "CastError" ? 400 : 500;
    res.status(statusCode).json({
      success: false,
      message: error?.message || "Error creating banner",
    });
  }
};

export const updateBanner = async (req: Request, res: Response) => {
  try {
    const existing = await Banner.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Banner not found" });
    }

    const updates: Record<string, any> = {};
    const { title, subtitle, link, isActive, order, startDate, endDate } = req.body;

    if (title !== undefined) updates.title = title.trim();
    if (subtitle !== undefined) updates.subtitle = subtitle?.trim();
    if (link !== undefined) updates.link = link;
    if (isActive !== undefined) {
      updates.isActive = isActive === "true" || isActive === true;
    }
    if (order !== undefined) {
      const orderValue = Number(order);
      const duplicate = await Banner.findOne({ order: orderValue, _id: { $ne: req.params.id } });
      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: `Order ${orderValue} is already taken by another banner. Please choose a different order.`,
        });
      }
      updates.order = orderValue;
    }

    if (startDate !== undefined && startDate !== "") {
      const parsed = new Date(startDate);
      if (isNaN(parsed.getTime())) {
        return res.status(400).json({ success: false, message: "Invalid start date format." });
      }
      updates.startDate = parsed;
    } else if (startDate === "") {
      updates.startDate = null;
    }

    if (endDate !== undefined && endDate !== "") {
      const parsed = new Date(endDate);
      if (isNaN(parsed.getTime())) {
        return res.status(400).json({ success: false, message: "Invalid end date format." });
      }
      updates.endDate = parsed;
    } else if (endDate === "") {
      updates.endDate = null;
    }

    const file = req.file;
    if (file) {
      const newImage = await uploadImageToCloudinary(file);
      updates.image = newImage;
      await deleteImageFromCloudinary(existing.image);
    }

    const banner = await Banner.findByIdAndUpdate(req.params.id, updates, {
      returnDocument: "after",
      runValidators: true,
    });

    res.json({ success: true, data: banner });
  } catch (error: any) {
    console.error("Error updating banner:", error);
    const statusCode =
      error?.name === "ValidationError" || error?.name === "CastError" ? 400 : 500;
    res.status(statusCode).json({
      success: false,
      message: error?.message || "Error updating banner",
    });
  }
};

export const deleteBanner = async (req: Request, res: Response) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) {
      return res.status(404).json({ success: false, message: "Banner not found" });
    }

    try {
      await deleteImageFromCloudinary(banner.image);
    } catch (cloudinaryError) {
      console.error("Failed to delete banner image from Cloudinary:", cloudinaryError);
    }

    res.json({ success: true, message: "Banner deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Error deleting banner" });
  }
};
