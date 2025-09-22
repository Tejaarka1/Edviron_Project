// backend/controllers/payment.controller.js
const Order = require('../models/Order');
const OrderStatus = require('../models/OrderStatus');
const { callCreateCollectRequest, checkCollectRequestStatus } = require('../services/payment.service');

exports.createPayment = async (req, res, next) => {
  try {
    const { student_info, order_amount, custom_order_id, trustee_id, gateway_name, callback_url } = req.body;
    if (!order_amount || !student_info) return res.status(400).json({ message: 'Missing student_info or order_amount' });

    // create order with basic info
    const order = await Order.create({
      school_id: process.env.SCHOOL_ID || 'SCHOOL_TEST',
      trustee_id: trustee_id || null,
      student_info,
      gateway_name: gateway_name || null,
      custom_order_id: custom_order_id || `ORD-${Date.now()}`
    });

    // store basic initiated status
    const orderStatus = await OrderStatus.create({
      collect_id: order._id,
      order_amount,
      status: 'initiated'
    });

    // Prepare callback_url - if frontend didn't pass one, you can construct a default
    const cb = callback_url || `${process.env.FRONTEND_BASE_URL || 'http://localhost:3000'}/payment-callback`;
    // const cb = callback_url || `${process.env.FRONTEND_BASE_URL || 'http://localhost:3000'}/payment-callback`;

    // call the payment gateway
    const gatewayResp = await callCreateCollectRequest({ amount: order_amount, callback_url: cb });

    // gatewayResp should contain collect_request_id and Collect_request_url
    // Save them on the Order so we can track later
    order.collect_request_id = gatewayResp.collect_request_id || gatewayResp.collect_request_id || null;
    order.collect_request_url = gatewayResp.Collect_request_url || gatewayResp.collect_request_url || gatewayResp.payment_url || null;
    await order.save();

    // Return relevant bits to frontend so it can redirect browser
    return res.json({
      order_id: order._id,
      custom_order_id: order.custom_order_id,
      collect_request_id: order.collect_request_id,
      payment_url: order.collect_request_url,
      gateway_response: gatewayResp
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Optional: expose a route to check status from backend (will call gateway status API)
 */
exports.checkStatus = async (req, res, next) => {
  try {
    const { collect_request_id } = req.params;
    if (!collect_request_id) return res.status(400).json({ message: 'collect_request_id required' });

    const gatewayResp = await checkCollectRequestStatus(collect_request_id);
    return res.json({ gatewayResp });
  } catch (err) {
    next(err);
  }
};
