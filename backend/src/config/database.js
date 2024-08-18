const { connect } = require("mongoose");

const connectDB = async (DB_URL) => {
  try {
    await connect(DB_URL);
    console.log("Database Connect Successfully...");
  } catch (error) {
    console.error(error);
  }
};

module.exports = connectDB;
