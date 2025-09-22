const express = require("express");
const router = express.Router();

const transactionsController = require("../controllers/transactions.controller");
const dashboardController = require("../controllers/dashboard.controller");

// Transactions
router.get("/transactions", transactionsController.getTransactions);
router.get("/transactions/:id", transactionsController.getTransactionById);
router.get("/transactions/school/:schoolId", transactionsController.getTransactionsBySchool);
router.get("/transactions/schools", transactionsController.getDistinctSchools);
router.get("/transaction-status/:id", transactionsController.getTransactionStatus);

// Dashboard stats
router.get("/dashboard", dashboardController.getDashboardStats);

module.exports = router;
