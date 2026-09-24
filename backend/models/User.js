const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.generateAuthToken = function () {
  const secret = process.env.JWT_SECRET || 'dev_jwt_secret';
  return jwt.sign({ id: this._id }, secret, { expiresIn: '30d' });
};

userSchema.methods.public = function () {
  return { id: this._id, name: this.name, email: this.email };
};

module.exports = mongoose.model('User', userSchema);
