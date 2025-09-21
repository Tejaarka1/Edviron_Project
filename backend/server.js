require("dotenv").config();
const app = require("./app");
const { connectDB } = require("./config/db");
// const transactionRoutes = require("./routes/transactionRoutes"); // no .js needed in CJS

// app.use("/api/transactions", transactionRoutes);

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error("Failed to connect DB:", err);
    process.exit(1);
  });
