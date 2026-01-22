const mongoose = require("mongoose");

const dbConnect = async () => {
  try {
    const dbcon = await mongoose.connect(process.env.MONGODB_URL);
    if (dbcon) {
      console.log("Database is Connected successfully now");
    } else {
      console.log("Database Not Connected");
    }
  } catch (error) {
    console.log(`Connection Error: ${error}`);
  }
};
module.exports = dbConnect;

