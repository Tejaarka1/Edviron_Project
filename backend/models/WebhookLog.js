const mongoose = require('mongoose');

const WebhookLogSchema = new mongoose.Schema({
  payload: mongoose.Schema.Types.Mixed,
  received_at: { type: Date, default: Date.now },
  endpoint: String
});

module.exports = mongoose.model('WebhookLog', WebhookLogSchema);
