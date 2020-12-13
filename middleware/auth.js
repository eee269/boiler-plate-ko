const { User } = require("../models/User");

let auth = (req, res, next) => {
    // 인증처리를 하는 곳
    // 클라이언트 쿠키에서 토큰을 가져오기
    let token = req.cookies.x_auth;

    // 토큰을 복호화한 후 유저를 찾는다.
    User.findByToken(token, (err, user) => {
        
        // 유저가 있으면 인증 OK
        // 유저가 없으면 인증 NO
        if(err) throw err;
        if(!user) return res.json({ isAuth: false, err: true })

        req.token = token;
        req.user = user;

        next();     // 이 함수가 middle ware이기 때문에 다음으로 넘어갈 수 있게 해줌
    })
}

module.exports = { auth };