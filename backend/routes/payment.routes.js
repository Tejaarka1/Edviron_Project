const router = require("express").Router();
const paymentController = require("../controllers/payment.controller");

// If you require auth for create-payment, add your auth middleware here.
// router.post("/create-payment", auth, paymentController.createPayment);
router.post("/create-payment", paymentController.createPayment);

// callback route that PG will redirect to (or you can use webhook)
router.get("/payment-callback", paymentController.paymentCallback);

module.exports = router;
