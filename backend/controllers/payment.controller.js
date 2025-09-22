// backend/controllers/payment.controller.js
const Order = require("../models/Order");
const OrderStatus = require("../models/OrderStatus");
const { callCreateCollectRequest, checkCollectRequestStatus } = require("../services/payment.service");

/**
 * POST /api/payment/create-payment
 */
exports.createPayment = async (req, res, next) => {
  try {
    const { student_info, order_amount, custom_order_id, trustee_id, gateway_name, callback_url } = req.body;
    if (!order_amount || !student_info) return res.status(400).json({ message: "Missing student_info or order_amount" });

    const order = await Order.create({
      school_id: process.env.SCHOOL_ID || "SCHOOL_TEST",
      trustee_id: trustee_id || null,
      student_info,
      gateway_name: gateway_name || null,
      custom_order_id: custom_order_id || `CUST-${Date.now()}`,
    });

    await OrderStatus.create({
      collect_id: order._id,
      order_amount: Number(order_amount),
      status: "initiated",
    });

    const cb = callback_url || `${process.env.FRONTEND_BASE_URL || "http://localhost:5173"}/payment-callback`;

    const gatewayResp = await callCreateCollectRequest({ amount: order_amount, callback_url: cb });

    const collectId = gatewayResp.collect_request_id || gatewayResp.collect_id || gatewayResp.collectRequestId || null;
    const paymentUrl =
      gatewayResp.Collect_request_url ||
      gatewayResp.collect_request_url ||
      gatewayResp.payment_url ||
      gatewayResp.paymentUrl ||
      gatewayResp.url ||
      null;

    if (collectId) order.collect_request_id = String(collectId);
    if (paymentUrl) order.collect_request_url = paymentUrl;

    await order.save();

    return res.json({
      ok: true,
      order_id: order._id,
      custom_order_id: order.custom_order_id,
      collect_request_id: order.collect_request_id,
      payment_url: order.collect_request_url,
      gateway_response: gatewayResp,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/payment/status/:collect_request_id
 * Call gateway status API then upsert OrderStatus in DB.
 */
exports.checkStatus = async (req, res, next) => {
  try {
    const { collect_request_id } = req.params;
    if (!collect_request_id) return res.status(400).json({ message: "collect_request_id required" });

    const gatewayResp = await checkCollectRequestStatus(collect_request_id);

    // find order
    let order = await Order.findOne({ collect_request_id: String(collect_request_id) });
    if (!order) {
      const customId = gatewayResp.custom_order_id || gatewayResp.order_ref || gatewayResp.order_id;
      if (customId) order = await Order.findOne({ custom_order_id: customId });
    }

    const statusValue =
      (gatewayResp.status && String(gatewayResp.status).toLowerCase()) ||
      (gatewayResp.code === 200 ? "success" : null) ||
      null;

    const statusDoc = {
      collect_id: order ? order._id : null,
      order_amount: gatewayResp.order_amount || gatewayResp.amount || null,
      transaction_amount: gatewayResp.transaction_amount || gatewayResp.transactionAmount || gatewayResp.txn_amount || null,
      payment_mode: gatewayResp.payment_mode || gatewayResp.paymentMode || null,
      payment_details: gatewayResp.payment_details || gatewayResp.payemnt_details || null,
      bank_reference: gatewayResp.bank_reference || gatewayResp.bank_ref || null,
      payment_message: gatewayResp.payment_message || gatewayResp.message || null,
      status: statusValue || "unknown",
      error_message: gatewayResp.error_message || null,
      payment_time: gatewayResp.payment_time ? new Date(gatewayResp.payment_time) : undefined,
    };

    let updated;
    if (order) {
      updated = await OrderStatus.findOneAndUpdate({ collect_id: order._id }, statusDoc, {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      });
    } else {
      updated = await OrderStatus.create(statusDoc);
    }

    return res.json({ ok: true, gatewayResp, updatedStatus: updated });
  } catch (err) {
    next(err);
  }
};
