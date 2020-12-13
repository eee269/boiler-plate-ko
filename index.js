// 다운로드 해 놓은 모듈 가져오기
const express = require('express')
// express를 사용하는 변수 만들기
const app = express()
// 백서버 (3000, 4000, 5000 아무렇게나~)
const port = 5000

// mongodb uri를 가져올 방식이 저장된 key.js에서 uri 갖고오기
const config = require('./config/key');

// body-parser 가져오기
const bodyParser = require('body-parser');

const cookieParser = require('cookie-parser');

const { auth } = require('./middleware/auth');

// User.js 를 통해 받아지는 정보 가져오기
const{ User } = require("./models/User");

// body-parser 옵션 주기
// application/x-www-form-urlencoded 분석해서 가져오기
app.use(bodyParser.urlencoded({extended: true}));
// application/json 분석해서 가져오기
app.use(bodyParser.json());

app.use(cookieParser());


const mongoose = require('mongoose');
const { request } = require('express');
// mongodb+srv://yejin:<password>@boilerplate.e11ek.mongodb.net/<dbname>?retryWrites=true&w=majority
mongoose.connect(config.mongoURI, {
    // error 발생 방지
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
}).then(() => console.log('MongoDB Connected...'))  // DB에 연결이 됐는지 확인
  .catch(err => console.log(err))   // error 발생 시 확인




// 루트 디렉토리에 Hello World 출력하게 함
app.get('/', (req, res) => res.send('Hello World!~~ 안녕하세요~~ hello!'))

// post man 사용 세팅
// Express에서 제공하는 Router를 사용하여 정리 (/api/users/경로)
app.post('/api/users/register', (req, res) => {
  // 회원가입 할 때 필요한 정보들을 client에서 가져오면 그것들을 디비에 넣어준다.
  const user = new User(req.body)

  // userInfo 정보를 가지고 오다가 에러가 나면 json형식으로 
  user.save((err, userInfo) => {
    // client에게 성공하지 못했다고 err메시지와 함께 전달
    if(err) return res.json({ success : false, err})
    // 성공했으면 성공했다고 전달
    return res.status(200).json({
      success: true
    })
  });

});




app.post('/api/users/login', (req, res) => {
  // 1. 요청된 이메일을 데이터베이스에서 있는지 찾는다.
  // mongoDB에서 제공하는 메서드인 findOne 사용
  User.findOne({ email: req.body.email }, (err, user) => {
    if(!user) {
      return res.json({
        loginSuccess: false,
        message: "제공된 이메일에 해당하는 유저가 없습니다."
      })
    }

    // 2. 요청된 이메일이 데이터베이스에 있다면 비밀번호가 맞는 비밀번호인지 확인
    user.comparePassword(req.body.password, (err, isMatch) => {
      if(!isMatch) return res.json({
        loginSuccess: false,
        message: "비밀번호가 틀렸습니다."
      })

      // 3. 비밀번호까지 맞다면 토큰을 생성하기.
      user.generateToken((err, user) => {
        if(err) return res.status(400).send(err);

        // 토큰을 저장한다. 어디에? 쿠키/로컬스토리지.. 등등 중에서 쿠키!
        res.cookie("x_auth", user.token)  // x_auth 이름의 쿠키에 user의 token 저장됨
        .status(200)
        .json({ loginSuccess: true, userId: user._id })
      })
    })
  })
})

// middle ware: call back function 하기 전에 해주는 것
// role: 0 -> 일반유저, role: 0이 아니면 관리자
app.get('/api/users/auth', auth, (req, res) => {
  // 여기까지 미들웨어를 통과해 왔다는 얘기는
  // Authentication이 true라는 말
  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role === 0? false: true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image
  })
})

app.get('/api/users/logout', auth, (req, res) => {
  User.findOneAndUpdate({_id: req.user._id},
    {token: ""}
    , (err, user) => {
      if(err) return res.json({success: false, err});
      return res.status(200).send({
        success: true
      })
    })
})



// app이 포트번호 5000번에서 실행
app.listen(port, () => console.log(`Example app listening on port ${port}!`))

