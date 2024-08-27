// userModel.js
const { Schema, model } = require("mongoose");

const userModelSchema = Schema({
  username: { type: String, require: true },
  email: { type: String, require: true },
  password: { type: String, require: true },
  photo: { type: String, require: true },
  roles: {
    type: [String],
    enum: ["Admin", "Organizer", "User"],
    default: ["User"],
  },
  isDisabled: { type: Boolean, default: false }, 
  joinedEvents: [{ type: Schema.Types.ObjectId, ref: 'Event', default: [] }]
});

const userModel = model("User", userModelSchema);

module.exports = userModel;
