require('dotenv').config();
const { connectDB } = require('../config/db');
const Order = require('../models/Order');
const OrderStatus = require('../models/OrderStatus');
const User = require('../models/User');

const run = async () => {
  await connectDB();

  console.log('Clearing existing data...');
  await Order.deleteMany({});
  await OrderStatus.deleteMany({});
  await User.deleteMany({});

  console.log('Creating sample user...');
  await User.create({ email: 'admin@example.com', password: 'password123', name: 'Admin User' });

  console.log('Seeding orders & statuses...');
  for (let i = 0; i < 30; i++) {
    const o = await Order.create({
      school_id: (i % 3 === 0) ? 'SCHOOL_A' : (i % 3 === 1) ? 'SCHOOL_B' : 'SCHOOL_C',
      trustee_id: `TRUSTEE_${i}`,
      student_info: { name: `Student ${i}`, id: `STU${i}`, email: `stu${i}@example.com`},
      gateway_name: ['PhonePe', 'Paytm', 'Razorpay'][i % 3],
      custom_order_id: `CUST-${i}`
    });
    await OrderStatus.create({
      collect_id: o._id,
      order_amount: 2000 + i * 10,
      transaction_amount: 2000 + i * 10 + 50,
      payment_mode: (i % 2 === 0) ? 'upi' : 'card',
      payment_details: `detail-${i}`,
      bank_reference: `BANK-${i}`,
      payment_message: 'success',
      status: i % 5 === 0 ? 'failed' : 'success',
      payment_time: new Date(Date.now() - i * 86400000)
    });
  }

  console.log('Seeding done.');
  process.exit(0);
};

run().catch(err => {
  console.error(err);
  process.exit(1);
});
