// 다운로드 해 놓은 모듈 가져오기
const express = require('express')
// express를 사용하는 변수? 앱 만들기
const app = express()
// 백서버 (3000, 4000, 5000 아무렇게나~)
const port = 5000

// mongodb uri를 가져올 방식이 저장된 key.js에서 uri 갖고오기
const config = require('./config/key');

// body-parser 가져오기
const bodyParser = require('body-parser');
// User.js 를 통해 받아지는 정보 가져오기
const{ User } = require("./models/User");

// body-parser 옵션 주기
// application/x-www-form-urlencoded 분석해서 가져오기
app.use(bodyParser.urlencoded({extended: true}));
// application/json 분석해서 가져오기
app.use(bodyParser.json());

const mongoose = require('mongoose')
// mongodb+srv://yejin:<password>@boilerplate.e11ek.mongodb.net/<dbname>?retryWrites=true&w=majority
mongoose.connect(config.mongoURI, {
    // error 발생 방지
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
}).then(() => console.log('MongoDB Connected...'))  // DB에 연결이 됐는지 확인
  .catch(err => console.log(err))   // error 발생 시 확인




// 루트 디렉토리에 Hello World 출력하게 함
app.get('/', (req, res) => res.send('Hello World!~~ 안녕하세요~~ hello!'))

// post man 사용 세팅
app.post('/register', (req, res) => {
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
  })

})



// app이 포트번호 5000번에서 실행
app.listen(port, () => console.log(`Example app listening on port ${port}!`))

