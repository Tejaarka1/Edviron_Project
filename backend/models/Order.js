// backend/models/Order.js
const mongoose = require('mongoose');

const StudentInfoSchema = new mongoose.Schema({
  name: String,
  id: String,
  email: String
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  school_id: { type: String, index: true },
  trustee_id: { type: String },
  student_info: StudentInfoSchema,
  gateway_name: { type: String },
  custom_order_id: { type: String, unique: true, index: true },
  collect_request_id: { type: String, index: true, sparse: true },
  collect_request_url: { type: String },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);
