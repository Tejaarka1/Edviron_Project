// backend/routes/webhook.routes.js
const router = require("express").Router();
const { webhookHandler } = require("../controllers/webhook.controller");

// public endpoint - gateway will POST here
router.post("/webhook", webhookHandler);

module.exports = router;
