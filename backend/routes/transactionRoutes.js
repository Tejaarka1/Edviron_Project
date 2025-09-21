const express = require("express");
const router = express.Router();

const mockTransaction = {
  _id: "1",
  school_id: "SCHOOL_A",
  custom_order_id: "CUST-0",
};

router.get("/", (req, res) => {
  res.json(mockTransaction);
});

module.exports = router;
