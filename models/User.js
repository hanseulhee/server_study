const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const saltRounds = 10

const userSchema = mongoose.Schema({
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
    maxlength: 10,
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
})

userSchema.pre('save', function (next) {
  let user = this

  if (user.isModified('password')) {
    bcrypt.genSalt(saltRounds, function (err, salt) {
      if (err) return next(err)

      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) return next(err)
        user.password = hash // 암호화된 비밀번호로 변경
        next()
      })
    })
  } else {
    next()
  }
})

const User = mongoose.model('User', userSchema)

module.exports = { User }
