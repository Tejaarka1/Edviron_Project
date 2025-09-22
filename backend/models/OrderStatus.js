const mongoose = require("mongoose");

const orderStatusSchema = new mongoose.Schema({
  collect_id: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  order_amount: { type: Number, required: true },
  transaction_amount: { type: String, default: "NA" },
  status: { type: String, enum: ["initiated", "success", "failed"], default: "initiated" },
  gateway: { type: String, default: "Sandbox" },  // will update on callback
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("OrderStatus", orderStatusSchema);
