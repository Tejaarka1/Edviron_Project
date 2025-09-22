const OrderStatus = require("../models/OrderStatus");

exports.getDashboardStats = async (req, res, next) => {
  try {
    const total = await OrderStatus.countDocuments();
    const success = await OrderStatus.countDocuments({ status: "success" });
    const failed = await OrderStatus.countDocuments({ status: "failed" });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const revenueAgg = await OrderStatus.aggregate([
      {
        $match: {
          status: "success",
          created_at: { $gte: today, $lt: tomorrow },
        },
      },
      {
        $addFields: {
          transaction_amount_num: {
            $cond: [
              { $isNumber: "$transaction_amount" },
              "$transaction_amount",
              {
                $convert: {
                  input: "$transaction_amount",
                  to: "double",
                  onError: 0,
                  onNull: 0,
                },
              },
            ],
          },
        },
      },
      {
        $group: { _id: null, total: { $sum: "$transaction_amount_num" } },
      },
    ]);

    const todayRevenue = revenueAgg[0]?.total || 0;

    res.json({ total, success, failed, todayRevenue });
  } catch (err) {
    next(err);
  }
};
