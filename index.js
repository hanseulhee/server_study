const express = require("express");
const app = express();
const port = 3000;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const { User } = require("./models/User");
const { auth } = require("./middleware/auth");

const config = require("./config/key");

app.use(bodyParser.urlencoded({ extended: true })); // application/x-www-form-urlencoded 형식을 처리
app.use(bodyParser.json()); // JSON 형식의 데이터를 처리
app.use(cookieParser());

const mongoose = require("mongoose");

mongoose
  .connect(config.mongoURI)
  .then(() => console.log("MongoDB 연결 성공"))
  .catch((err) => console.log("MongoDB 연결 실패", err));

app.get("/", (req, res) => res.send("안농"));

app.post("/api/register", async (req, res) => {
  try {
    const user = new User(req.body);
    const userInfo = await user.save();
    return res.status(200).json({
      success: true,
      user: userInfo,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.json({
        loginSuccess: false,
        message: "이메일에 해당하는 사용자가 없습니다.",
      });
    }

    const isMatch = await user.comparePassword(req.body.password);
    if (!isMatch) {
      return res.json({
        loginSuccess: false,
        message: "비밀번호가 틀렸습니다.",
      });
    }

    const updatedUser = await user.generateToken();
    res
      .cookie("sh_auth", updatedUser.token)
      .status(200)
      .json({ loginSuccess: true, userId: updatedUser._id });
  } catch (err) {
    res.status(500).json({ loginSuccess: false, message: "서버 오류 발생" });
  }
});

app.get("/api/users/auth", auth, (req, res) => {
  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    role: req.user.role,
    image: req.user.image,
  });
});

app.get("/api/users/logout", auth, (req, res) => {
  User.findOneAndUpdate({ _id: req.user._id }, { token: "" }, (err, user) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).send({
      success: true,
    });
  });
});

app.listen(port, () => console.log(`안농 ${port}`));
