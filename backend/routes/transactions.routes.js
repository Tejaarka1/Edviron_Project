// const router = require("express").Router();
// const auth = require("../middlewares/auth.middleware");

// const {
//   getTransactions,
//   getTransactionById,
//   getTransactionsBySchool,
//   getTransactionStatus,
// } = require("../controllers/transactions.controller");

// // list transactions with filters
// router.get("/transactions", auth, getTransactions);

// // by school
// router.get("/transactions/school/:schoolId", auth, getTransactionsBySchool);

// // check status (by _id or custom_order_id)
// router.get("/transaction-status/:id", auth, getTransactionStatus);

// // by transaction _id
// router.get("/transactions/:id", auth, getTransactionById);

// module.exports = router;


const router = require("express").Router();
const auth = require("../middlewares/auth.middleware");

const { 
  getTransactions, 
  getTransactionById, 
  getTransactionsBySchool, 
  getTransactionStatus 
} = require("../controllers/transactions.controller");

// Routes
router.get("/transactions", auth, getTransactions);
router.get("/transactions/:id", auth, getTransactionById);
router.get("/transactions/school/:schoolId", auth, getTransactionsBySchool);
router.get("/transaction-status/:id", auth, getTransactionStatus);

module.exports = router;
