const Order = require("../models/Order");
const OrderStatus = require("../models/OrderStatus");

/**
 * POST /api/payment/create-payment
 * Body: { studentName, studentId, email, amount, school_id }
 */
exports.createPayment = async (req, res, next) => {
  try {
    const { studentName, studentId, email, amount, school_id } = req.body;

    if (!amount || !studentName) {
      return res.status(400).json({ message: "studentName and amount required" });
    }

    const newOrder = await Order.create({
      school_id: school_id || process.env.SCHOOL_ID || "SCHOOL_TEST",
      custom_order_id: `ORD-${Date.now()}`,
      student_info: { name: studentName, id: studentId || "", email: email || "" },
      gateway_name: "Sandbox",
      created_at: new Date(),
    });

    await OrderStatus.create({
      collect_id: newOrder._id,
      order_amount: Number(amount) || 0,
      transaction_amount: 0, // numeric default
      status: "initiated",
      created_at: new Date(),
    });

    // In production you would call payment gateway and return real URL
    const paymentUrl = `${process.env.FRONTEND_BASE_URL || "http://localhost:5173"}/payment-callback?edvironCollectRequestId=${newOrder._id}&status=initiated`;

    return res.json({
      success: true,
      collect_id: newOrder._id,
      payment_url: paymentUrl,
      custom_order_id: newOrder.custom_order_id,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/payment/payment-callback
 * Query params from PG: edvironCollectRequestId, status, amount
 */
exports.paymentCallback = async (req, res, next) => {
  try {
    const { edvironCollectRequestId, status, amount } = req.query;
    const orderId = edvironCollectRequestId;

    if (!orderId) return res.status(400).send("Missing collect id");

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).send("Order not found");

    await OrderStatus.findOneAndUpdate(
      { collect_id: order._id },
      {
        $set: {
          status: status || "failed",
          transaction_amount: Number(amount) || 0,
          payment_time: new Date(),
          updated_at: new Date(),
        },
      },
      { upsert: false, new: true }
    );

    // redirect to frontend result page
    return res.redirect(`${process.env.FRONTEND_BASE_URL || "http://localhost:5173"}/dashboard/transactions`);
  } catch (err) {
    next(err);
  }
};
