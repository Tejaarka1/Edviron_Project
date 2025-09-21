const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI not defined in environment');
  await mongoose.connect(uri, {
    // useNewUrlParser/useUnifiedTopology are default with newer mongoose,
    // left blank to use defaults
  });
  console.log('MongoDB connected');
};

module.exports = { connectDB };
