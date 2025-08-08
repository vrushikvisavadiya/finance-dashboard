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

/* --------------------------  READ ALL (WITH PAGINATION & FILTERS)  -------------------------- */
export const listTransactions = async (req, res) => {
  try {
    // Extract query parameters with defaults
    const {
      page = 1,
      limit = 10,
      category,
      type, // income or expense
      startDate,
      endDate,
      search, // search in note/description
      sortBy = "date",
      sortOrder = "desc",
    } = req.query;

    // Convert to numbers
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build filter object
    const filter = { userId: req.user._id };

    // Category filter
    if (category) {
      filter.category = category;
    }

    // Type filter
    if (type && ["income", "expense"].includes(type)) {
      filter.type = type;
    }

    // Date range filter
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = new Date(startDate);
      }
      if (endDate) {
        // Add time to end date to include the entire day
        const endDateObj = new Date(endDate);
        endDateObj.setHours(23, 59, 59, 999);
        filter.date.$lte = endDateObj;
      }
    }

    // Search filter (in note or description)
    if (search) {
      filter.$or = [
        { note: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Execute queries
    const [transactions, totalCount] = await Promise.all([
      Transaction.find(filter)
        .populate("category", "name type")
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(), // Use lean() for better performance
      Transaction.countDocuments(filter),
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    return ok(res, 200, "Transactions fetched successfully", {
      transactions,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCount,
        limit: limitNum,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? pageNum + 1 : null,
        prevPage: hasPrevPage ? pageNum - 1 : null,
      },
      filters: {
        category,
        type,
        startDate,
        endDate,
        search,
        sortBy,
        sortOrder,
      },
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

/* --------------------------  GET TRANSACTION STATS  -------------------------- */
export const getTransactionStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = { userId: req.user._id };

    // Apply date filter if provided
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) {
        const endDateObj = new Date(endDate);
        endDateObj.setHours(23, 59, 59, 999);
        filter.date.$lte = endDateObj;
      }
    }

    const stats = await Transaction.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    const result = {
      totalIncome: 0,
      totalExpense: 0,
      incomeCount: 0,
      expenseCount: 0,
      balance: 0,
    };

    stats.forEach((stat) => {
      if (stat._id === "income") {
        result.totalIncome = stat.total;
        result.incomeCount = stat.count;
      } else if (stat._id === "expense") {
        result.totalExpense = stat.total;
        result.expenseCount = stat.count;
      }
    });

    result.balance = result.totalIncome - result.totalExpense;

    return ok(res, 200, "Transaction stats fetched successfully", result);
  } catch (err) {
    console.error("Get Transaction Stats:", err);
    return fail(res, 500, "Server error");
  }
};
