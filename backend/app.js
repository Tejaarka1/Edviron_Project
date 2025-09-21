const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const { errorHandler } = require("./middlewares/error.middleware");

const authRoutes = require("./routes/auth.routes");
const paymentRoutes = require("./routes/payment.routes");
const webhookRoutes = require("./routes/webhook.routes");
const transactionsRoutes = require("./routes/transactions.routes");

const app = express();

// middlewares
app.use(cors());
app.use(morgan("dev"));
app.use(express.json({ limit: "1mb" }));

// root health check
app.get("/", (req, res) =>
  res.json({ ok: true, message: "EDVIRON backend running" })
);

// mount routes
app.use("/api/auth", authRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api", webhookRoutes);
app.use("/api", transactionsRoutes); // ✅ includes /transactions, /transaction-status, etc.

// global error handler
app.use(errorHandler);

module.exports = app;
