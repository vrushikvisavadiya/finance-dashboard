import Category from "../models/Category.js";

// Create personal category
export const createCategory = async (req, res) => {
  const { name, type = "expense" } = req.body;
  if (!name)
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: [{ field: "name", message: "Name is required" }],
    });

  const exists = await Category.findOne({
    name,
    $or: [{ userId: req.user._id }, { isDefault: true }],
  });
  if (exists)
    return res.status(409).json({
      success: false,
      message: "Category already exists",
      error: "Duplicate category name",
    });

  const category = await Category.create({
    userId: req.user._id,
    name,
    type,
    isDefault: false,
  });

  return res.status(201).json({
    success: true,
    message: "Category created successfully",
    data: { category },
  });
};

// Get current user’s categories + global defaults
export const getCategories = async (req, res) => {
  const categories = await Category.find({
    $or: [{ userId: req.user._id }, { isDefault: true }],
  }).sort({ isDefault: -1, name: 1 });

  res.status(200).json({
    success: true,
    message: "Categories retrieved successfully",
    data: { categories },
  });
};
