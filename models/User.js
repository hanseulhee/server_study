const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 10,
  },
  email: {
    type: String,
    required: true,
    trim: true, // 공백 제거
    unique: true, // 중복 방지
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role: {
    type: Number,
    default: 0, // 0: 일반 사용자, 1: 관리자
  },
  image: String,
  token: {
    type: String,
  },
  // 토큰 유효 기간
  tokenExp: {
    type: Number,
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(this.password, salt);
    this.password = hash;
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = async function (plainPassword) {
  return await bcrypt.compare(plainPassword, this.password);
};

userSchema.methods.generateToken = async function () {
  const token = jwt.sign({ _id: this._id.toHexString() }, "secretToken");
  this.token = token;
  return await this.save();
};

userSchema.statics.findByToken = async function (token) {
  try {
    const decoded = jwt.verify(token, "secretToken");
    return await this.findOne({ _id: decoded._id, token });
  } catch (err) {
    throw err;
  }
};

const User = mongoose.model("User", userSchema);

module.exports = { User };
