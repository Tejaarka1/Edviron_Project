// backend/routes/payment.routes.js
const router = require("express").Router();
const auth = require("../middlewares/auth.middleware");
const { createPayment, checkStatus } = require("../controllers/payment.controller");

// Create payment (protected)
router.post("/create-payment", auth, createPayment);

// Check status - keep protected if frontend can call with token; otherwise remove auth
router.get("/status/:collect_request_id", auth, checkStatus);

module.exports = router;
