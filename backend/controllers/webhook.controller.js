const WebhookLog = require('../models/WebhookLog');
const OrderStatus = require('../models/OrderStatus');
const Order = require('../models/Order');
const mongoose = require('mongoose');

exports.webhookHandler = async (req, res, next) => {
  try {
    const payload = req.body || {};
    await WebhookLog.create({ payload, endpoint: '/webhook' });

    // interpret payload based on common pattern in assessment docs
    const info = payload.order_info || payload;

    const orderIdentifier = info.order_id || info.collect_id || info.custom_order_id || info.order_ref;

    // try find by Mongo ObjectId
    let order = null;
    if (orderIdentifier && mongoose.Types.ObjectId.isValid(orderIdentifier)) {
      order = await Order.findById(orderIdentifier);
    }

    // fallback: find by custom_order_id
    if (!order && info.custom_order_id) {
      order = await Order.findOne({ custom_order_id: info.custom_order_id });
    }
    // fallback: some gateways may send order_id as custom id string
    if (!order && info.order_id && typeof info.order_id === 'string' && !mongoose.Types.ObjectId.isValid(info.order_id)) {
      order = await Order.findOne({ custom_order_id: info.order_id });
    }

    const statusDoc = {
      collect_id: order ? order._id : null,
      order_amount: info.order_amount || info.amount || null,
      transaction_amount: info.transaction_amount || info.txn_amount || null,
      payment_mode: info.payment_mode || info.payment_mode,
      payment_details: info.payemnt_details || info.payment_details || null,
      bank_reference: info.bank_reference || info.bank_ref || null,
      payment_message: info.Payment_message || info.payment_message || info.message || null,
      status: info.status || (info.code === 200 ? 'success' : 'failed') || 'unknown',
      error_message: info.error_message || null,
      payment_time: info.payment_time ? new Date(info.payment_time) : undefined
    };

    if (order) {
      await OrderStatus.findOneAndUpdate(
        { collect_id: order._id },
        statusDoc,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    } else {
      // create a status record without link to order
      await OrderStatus.create(statusDoc);
    }

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};
