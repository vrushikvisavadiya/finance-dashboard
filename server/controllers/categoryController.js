import Category from "../models/Category.js";
import mongoose from "mongoose"; // ADD THIS IMPORT

// Helper functions for consistent responses
const ok = (res, message, data, status = 200) =>
  res.status(status).json({ success: true, message, data });

const fail = (res, status, message, error = null) =>
  res.status(status).json({ success: false, message, ...(error && { error }) });

// Create personal category
export const createCategory = async (req, res) => {
  try {
    const { name, type = "expense" } = req.body;

    if (!name) {
      return fail(res, 400, "Validation failed", {
        field: "name",
        message: "Name is required",
      });
    }

    const exists = await Category.findOne({
      name,
      $or: [{ userId: req.user._id }, { isDefault: true }],
    });

    if (exists) {
      return fail(
        res,
        409,
        "Category already exists",
        "Duplicate category name"
      );
    }

    const category = await Category.create({
      userId: req.user._id,
      name,
      type,
      isDefault: false,
    });

    return ok(res, "Category created successfully", { category }, 201);
  } catch (error) {
    console.error("Create category error:", error);
    return fail(res, 500, "Failed to create category. Please try again.");
  }
};

// Get current user's categories + global defaults
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({
      $or: [{ userId: req.user._id }, { isDefault: true }],
    }).sort({ isDefault: -1, name: 1 });

    return ok(res, "Categories retrieved successfully", { categories });
  } catch (error) {
    console.error("Get categories error:", error);
    return fail(res, 500, "Failed to retrieve categories. Please try again.");
  }
};

// Update/Edit category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type } = req.body;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return fail(res, 400, "Invalid category ID format");
    }

    if (!name) {
      return fail(res, 400, "Validation failed", {
        field: "name",
        message: "Name is required",
      });
    }

    // Find the category and check ownership
    const category = await Category.findById(id);

    if (!category) {
      return fail(res, 404, "Category not found");
    }

    // Check if user owns the category (can't edit default categories)
    if (category.isDefault) {
      return fail(
        res,
        403,
        "Cannot edit default categories",
        "Permission denied"
      );
    }

    // Check ownership - handle null userId for default categories
    if (
      !category.userId ||
      category.userId.toString() !== req.user._id.toString()
    ) {
      return fail(
        res,
        403,
        "Access denied",
        "You can only edit your own categories"
      );
    }

    // Check for duplicate name (excluding current category)
    const duplicate = await Category.findOne({
      name,
      _id: { $ne: id },
      $or: [{ userId: req.user._id }, { isDefault: true }],
    });

    if (duplicate) {
      return fail(
        res,
        409,
        "Category name already exists",
        "Duplicate category name"
      );
    }

    // Update the category
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { name, ...(type && { type }) },
      { new: true, runValidators: true }
    );

    return ok(res, "Category updated successfully", {
      category: updatedCategory,
    });
  } catch (error) {
    console.error("Update category error:", error);
    return fail(res, 500, "Failed to update category. Please try again.");
  }
};

// Delete category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return fail(res, 400, "Invalid category ID format");
    }

    // Find the category and check ownership
    const category = await Category.findById(id);

    if (!category) {
      return fail(res, 404, "Category not found");
    }

    // Check if user owns the category (can't delete default categories)
    if (category.isDefault) {
      return fail(
        res,
        403,
        "Cannot delete default categories",
        "Permission denied"
      );
    }

    // Check ownership - handle null userId for default categories
    if (
      !category.userId ||
      category.userId.toString() !== req.user._id.toString()
    ) {
      return fail(
        res,
        403,
        "Access denied",
        "You can only delete your own categories"
      );
    }

    // Delete the category
    await Category.findByIdAndDelete(id);

    return ok(res, "Category deleted successfully", { deletedId: id });
  } catch (error) {
    console.error("Delete category error:", error);
    return fail(res, 500, "Failed to delete category. Please try again.");
  }
};
