const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  title: { type: String, required: true },
  location: { type: String, required: true },
  startingdate: { type: Date, required: true },
  enddate: { type: Date, required: true },
  maxpeoples: { type: Number, required: true },
  attendees: { type: Number, default: 1 },
  rating: { type: [Number], default: [] },
});

module.exports = mongoose.model("Event", eventSchema);
