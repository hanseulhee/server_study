const { User } = require("../models/User");

// 인증처리
const auth = async (req, res, next) => {
  try {
    // client 쿠키를 가져옴
    let token = req.cookies.sh_auth;

    // 토큰을 복호화해 유저를 찾는다
    const user = await User.findByToken(token);

    if (!user) {
      return res.json({ isAuth: false, error: true });
    }

    req.token = token;
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ isAuth: false, error: true });
  }
};

module.exports = { auth };
