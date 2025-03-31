import mongoose from 'mongoose'

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/Event", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB Connected");
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

export default connectDB;