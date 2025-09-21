const mongoose = require('mongoose');

const OrderStatusSchema = new mongoose.Schema({
  collect_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', index: true },
  order_amount: Number,
  transaction_amount: Number,
  payment_mode: String,
  payment_details: String,
  bank_reference: String,
  payment_message: String,
  status: String,
  error_message: String,
  payment_time: Date,
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('OrderStatus', OrderStatusSchema);
