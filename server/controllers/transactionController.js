/*
  Transaction Controller
  ----------------------
  Handles all CRUD operations for income / expense records.
  Each record is tied to the authenticated user (req.user set by auth middleware).
*/

import Transaction from "../models/Transaction.js";
import Category from "../models/Category.js";

/* Helper: uniform success response */
const ok = (res, status, message, payload = {}) =>
  res.status(status).json({ success: true, message, data: payload });

/* Helper: uniform error response */
const fail = (res, status, message, errors) =>
  res.status(status).json({ success: false, message, errors });

/* --------------------------  CREATE  -------------------------- */
export const addTransaction = async (req, res) => {
  try {
    const {
      amount,
      date,
      categoryId,
      note,
      description,
      type = "expense",
    } = req.body;

    /* Basic field validation */
    if (!amount || !date || !categoryId)
      return fail(res, 400, "Validation failed", [
        { field: "amount/date/categoryId", message: "All are required" },
      ]);

    /* Make sure category exists AND belongs to user OR is a default */
    const category = await Category.findOne({
      _id: categoryId,
      $or: [{ userId: req.user._id }, { isDefault: true }],
    });

    if (!category) return fail(res, 404, "Category not found");

    /* Create transaction */
    const trx = await Transaction.create({
      userId: req.user._id,
      category: categoryId,
      amount,
      date,
      note,
      description,
      type,
    });

    return ok(res, 201, "Transaction created successfully", {
      transaction: trx,
    });
  } catch (err) {
    console.error("Add Transaction:", err);
    return fail(res, 500, "Server error");
  }
};

/* --------------------------  READ ALL  -------------------------- */
export const listTransactions = async (req, res) => {
  try {
    const trxs = await Transaction.find({ userId: req.user._id })
      .populate("category", "name type")
      .sort({ date: -1 });

    return ok(res, 200, "Transactions fetched successfully", {
      transactions: trxs,
    });
  } catch (err) {
    console.error("List Transactions:", err);
    return fail(res, 500, "Server error");
  }
};

/* --------------------------  READ ONE  -------------------------- */
export const getTransaction = async (req, res) => {
  try {
    const trx = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate("category", "name type");

    if (!trx) return fail(res, 404, "Transaction not found");
    return ok(res, 200, "Transaction fetched successfully", {
      transaction: trx,
    });
  } catch (err) {
    console.error("Get Transaction:", err);
    return fail(res, 500, "Server error");
  }
};

/* --------------------------  UPDATE  -------------------------- */
export const updateTransaction = async (req, res) => {
  try {
    const updates = req.body;

    /* If category is being changed, verify new category belongs to user/default */
    if (updates.categoryId) {
      const validCat = await Category.findOne({
        _id: updates.categoryId,
        $or: [{ userId: req.user._id }, { isDefault: true }],
      });
      if (!validCat) return fail(res, 404, "New category not found");
      updates.category = updates.categoryId; // map for schema field
      delete updates.categoryId;
    }

    const trx = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updates,
      { new: true }
    );

    if (!trx) return fail(res, 404, "Transaction not found");
    return ok(res, 200, "Transaction updated successfully", {
      transaction: trx,
    });
  } catch (err) {
    console.error("Update Transaction:", err);
    return fail(res, 500, "Server error");
  }
};

/* --------------------------  DELETE  -------------------------- */
export const deleteTransaction = async (req, res) => {
  try {
    const trx = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!trx) return fail(res, 404, "Transaction not found");
    return ok(res, 200, "Transaction deleted successfully");
  } catch (err) {
    console.error("Delete Transaction:", err);
    return fail(res, 500, "Server error");
  }
};
