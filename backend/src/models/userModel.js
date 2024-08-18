const { Schema, model } = require("mongoose");

const userModelSchema = Schema({
  username: { type: String, require: true },
  email: { type: String, require: true },
  password: { type: String, require: true },
  confirmPassword: { type: String, require: true },
  photo: { type: String, require: true },
  registeredEvents: [{ type: Schema.Types.ObjectId, ref: 'Event' }],
});

const userModel = model("user", userModelSchema);

module.exports = userModel;
