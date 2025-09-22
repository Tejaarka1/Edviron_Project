// backend/controllers/transactions.controller.js
const mongoose = require("mongoose");
const Order = require("../models/Order");
const OrderStatus = require("../models/OrderStatus");

/**
 * GET /api/transactions
 * Aggregates orders with latest order status.
 */
exports.getTransactions = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      sort = "created_at",
      order = "desc",
      status,
      schoolIds,
      startDate,
      endDate,
      search,
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const match = {};

    if (status) match["latestStatus.status"] = { $in: status.split(",") };
    if (schoolIds) match["school_id"] = { $in: schoolIds.split(",") };

    if (startDate || endDate) {
      const range = {};
      if (startDate) range.$gte = new Date(startDate);
      if (endDate) {
        const e = new Date(endDate);
        e.setHours(23, 59, 59, 999);
        range.$lte = e;
      }
      match["latestStatus.payment_time"] = range;
    }

    if (search) {
      const regex = new RegExp(search, "i");
      match.$or = [
        { custom_order_id: regex },
        { school_id: regex },
        { "student_info.name": regex },
        { "student_info.id": regex },
        { "student_info.email": regex },
      ];
    }

    const pipeline = [
      {
        $lookup: {
          from: "orderstatuses",
          let: { orderId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$collect_id", "$$orderId"] } } },
            { $sort: { created_at: -1 } },
            { $limit: 1 },
          ],
          as: "latestStatus",
        },
      },
      { $unwind: { path: "$latestStatus", preserveNullAndEmptyArrays: true } },
      { $match: match },
      {
        $project: {
          collect_id: "$_id",
          collect_request_id: "$collect_request_id",
          school_id: 1,
          gateway: "$gateway_name",
          order_amount: "$latestStatus.order_amount",
          transaction_amount: "$latestStatus.transaction_amount",
          status: "$latestStatus.status",
          custom_order_id: 1,
          student_name: "$student_info.name",
          student_id: "$student_info.id",
          student_email: "$student_info.email",
          payment_time: "$latestStatus.payment_time",
          created_at: 1,
        },
      },
      { $sort: { [sort]: order === "desc" ? -1 : 1 } },
      { $skip: skip },
      { $limit: Number(limit) },
    ];

    const results = await Order.aggregate(pipeline);
    const totalRes = await Order.countDocuments();

    res.json({ page: Number(page), limit: Number(limit), total: totalRes, data: results });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/transactions/:id
 */
exports.getTransactionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid transaction ID" });

    const order = await Order.findById(id).lean();
    if (!order) return res.status(404).json({ message: "Transaction not found" });

    const latestStatus = await OrderStatus.findOne({ collect_id: order._id }).sort({ created_at: -1 }).lean();

    res.json({ order, latestStatus });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/transactions/school/:schoolId
 */
exports.getTransactionsBySchool = async (req, res, next) => {
  try {
    const { schoolId } = req.params;
    const pipeline = [
      { $match: { school_id: schoolId } },
      {
        $lookup: {
          from: "orderstatuses",
          let: { orderId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$collect_id", "$$orderId"] } } },
            { $sort: { created_at: -1 } },
            { $limit: 1 },
          ],
          as: "latestStatus",
        },
      },
      { $unwind: { path: "$latestStatus", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          collect_id: "$_id",
          school_id: 1,
          gateway: "$gateway_name",
          order_amount: "$latestStatus.order_amount",
          transaction_amount: "$latestStatus.transaction_amount",
          status: "$latestStatus.status",
          custom_order_id: 1,
          student_name: "$student_info.name",
          student_id: "$student_info.id",
          student_email: "$student_info.email",
          payment_time: "$latestStatus.payment_time",
        },
      },
    ];

    const results = await Order.aggregate(pipeline);
    res.json({ success: true, data: results });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/transaction-status/:id
 * Accepts order _id or custom_order_id
 */
exports.getTransactionStatus = async (req, res, next) => {
  try {
    const id = req.params.id;
    let order = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      order = await Order.findById(id).lean();
    }
    if (!order) {
      order = await Order.findOne({ custom_order_id: id }).lean();
    }

    if (!order) return res.status(404).json({ message: "Order not found" });

    const latestStatus = await OrderStatus.findOne({ collect_id: order._id }).sort({ created_at: -1 }).lean();

    res.json({
      collect_id: order._id,
      school_id: order.school_id,
      gateway: order.gateway_name,
      custom_order_id: order.custom_order_id,
      order_amount: latestStatus?.order_amount || null,
      transaction_amount: latestStatus?.transaction_amount || null,
      status: latestStatus?.status || "initiated",
      payment_time: latestStatus?.payment_time || null,
      student_name: order.student_info?.name || "",
      student_id: order.student_info?.id || "",
      student_email: order.student_info?.email || "",
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/transactions/schools
 */
exports.getDistinctSchools = async (req, res, next) => {
  try {
    const schools = await Order.distinct("school_id");
    res.json({ success: true, data: schools });
  } catch (err) {
    next(err);
  }
};
