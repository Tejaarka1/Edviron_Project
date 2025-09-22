// backend/controllers/webhook.controller.js
const WebhookLog = require("../models/WebhookLog");
const OrderStatus = require("../models/OrderStatus");
const Order = require("../models/Order");
const mongoose = require("mongoose");

exports.webhookHandler = async (req, res, next) => {
  try {
    const payload = req.body || {};
    await WebhookLog.create({ payload, endpoint: "/webhook" });

    const info = payload.order_info || payload || {};
    const possibleIds = [
      info.order_id,
      info.collect_id,
      info.collect_request_id,
      info.order_ref,
      info.custom_order_id,
      payload.collect_request_id,
    ].filter(Boolean);

    let order = null;
    for (const id of possibleIds) {
      if (mongoose.Types.ObjectId.isValid(id)) {
        order = await Order.findById(id);
      }
      if (!order) {
        order = await Order.findOne({ collect_request_id: id });
      }
      if (!order && typeof id === "string") {
        order = await Order.findOne({ custom_order_id: id });
      }
      if (order) break;
    }

    const statusDoc = {
      collect_id: order ? order._id : null,
      order_amount: info.order_amount || info.amount || payload.amount || null,
      transaction_amount:
        info.transaction_amount || info.txn_amount || payload.transaction_amount || payload.txn_amount || null,
      payment_mode: info.payment_mode || info.paymentMethod || null,
      payment_details: info.payemnt_details || info.payment_details || null,
      bank_reference: info.bank_reference || info.bank_ref || info.bankReference || null,
      payment_message: info.Payment_message || info.payment_message || info.message || null,
      status: (info.status || payload.status || (payload.code === 200 ? "success" : null) || "unknown").toString().toLowerCase(),
      error_message: info.error_message || payload.error_message || null,
      payment_time: info.payment_time ? new Date(info.payment_time) : payload.payment_time ? new Date(payload.payment_time) : undefined,
    };

    if (order) {
      await OrderStatus.findOneAndUpdate({ collect_id: order._id }, statusDoc, {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      });
    } else {
      await OrderStatus.create(statusDoc);
    }

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};
