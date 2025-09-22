// backend/routes/transactions.routes.js
const router = require("express").Router();
const auth = require("../middlewares/auth.middleware");

const {
  getTransactions,
  getTransactionById,
  getTransactionsBySchool,
  getTransactionStatus,
  getDistinctSchools,
} = require("../controllers/transactions.controller");

// list transactions with filters (protected)
router.get("/transactions", auth, getTransactions);
router.get("/transactions/:id", auth, getTransactionById);
router.get("/transactions/school/:schoolId", auth, getTransactionsBySchool);
router.get("/transactions/schools", auth, getDistinctSchools);
router.get("/transaction-status/:id", auth, getTransactionStatus);

module.exports = router;
