const mongoose = require("mongoose");
const Order = require("../models/Order");
const OrderStatus = require("../models/OrderStatus");

/**
 * GET /transactions
 * Supports: pagination, filters, search, date range, sorting
 */
exports.getTransactions = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      sort = "payment_time",
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
      match.$or = [{ custom_order_id: regex }, { school_id: regex }];
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
          school_id: 1,
          gateway: "$gateway_name",
          order_amount: "$latestStatus.order_amount",
          transaction_amount: "$latestStatus.transaction_amount",
          status: "$latestStatus.status",
          custom_order_id: 1,
        },
      },
      { $sort: { [sort]: order === "desc" ? -1 : 1 } },
      { $skip: skip },
      { $limit: Number(limit) },
    ];

    const results = await Order.aggregate(pipeline);
    const total = await Order.countDocuments();

    res.json({ page: Number(page), limit: Number(limit), total, data: results });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /transactions/:id
 * Fetch transaction by Mongo _id
 */
exports.getTransactionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid transaction ID format" });
    }

    const order = await Order.findById(id).lean();
    if (!order) return res.status(404).json({ message: "Transaction not found" });

    const latestStatus = await OrderStatus.findOne({ collect_id: order._id })
      .sort({ created_at: -1 })
      .lean();

    res.json({
      collect_id: order._id,
      school_id: order.school_id,
      gateway: order.gateway_name,
      order_amount: latestStatus?.order_amount || null,
      transaction_amount: latestStatus?.transaction_amount || null,
      status: latestStatus?.status || null,
      custom_order_id: order.custom_order_id,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /transactions/school/:schoolId
 * Fetch all transactions for a given school
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
        },
      },
    ];

    const results = await Order.aggregate(pipeline);
    res.json(results);
  } catch (err) {
    next(err);
  }
};

// ... your getTransactions, getTransactionById, getTransactionsBySchool above ...

/**
 * GET /transaction-status/:id
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

    const latestStatus = await OrderStatus.findOne({ collect_id: order._id })
      .sort({ created_at: -1 })
      .lean();

    res.json({
      collect_id: order._id,
      school_id: order.school_id,
      gateway: order.gateway_name,
      custom_order_id: order.custom_order_id,
      order_amount: latestStatus?.order_amount || null,
      transaction_amount: latestStatus?.transaction_amount || null,
      status: latestStatus?.status || null,
      payment_time: latestStatus?.payment_time || null,
    });
  } catch (err) {
    next(err);
  }
};

// 

/**
 * GET /transaction-status/:id
 * Check status by Mongo _id or custom_order_id
 */
// exports.getTransactionById = async (req, res, next) => {
//   try {
//     const { id } = req.params;

//     // Validate if it's a proper Mongo ObjectId
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ message: "Invalid transaction ID format" });
//     }

//     // Fetch order
//     const order = await Order.findById(id).lean();
//     if (!order) {
//       return res.status(404).json({ message: "Transaction not found" });
//     }

//     // Fetch latest status for this order
//     const latestStatus = await OrderStatus.findOne({ collect_id: order._id })
//       .sort({ created_at: -1 })
//       .lean();

//     // Return only the required fields
//     res.json({
//       collect_id: order._id,
//       school_id: order.school_id,
//       gateway: order.gateway_name,
//       custom_order_id: order.custom_order_id,
//       order_amount: latestStatus?.order_amount || null,
//       transaction_amount: latestStatus?.transaction_amount || null,
//       status: latestStatus?.status || null,
//       payment_time: latestStatus?.payment_time || null,
//     });
//   } catch (err) {
//     next(err);
//   }
// };
