// 다운로드 해 놓은 모듈 가져오기
const express = require('express')
// express를 사용하는 변수? 앱 만들기
const app = express()
// 백서버 (3000, 4000, 5000 아무렇게나~)
const port = 5000

const mongoose = require('mongoose')
// mongodb+srv://yejin:<password>@boilerplate.e11ek.mongodb.net/<dbname>?retryWrites=true&w=majority
mongoose.connect('mongodb+srv://yejin:1234@boilerplate.e11ek.mongodb.net/test?retryWrites=true&w=majority', {
    // error 발생 방지
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
}).then(() => console.log('MongoDB Connected...'))  // DB에 연결이 됐는지 확인
  .catch(err => console.log(err))   // error 발생 시 확인




// 루트 디렉토리에 Hello World 출력하게 함
app.get('/', (req, res) => res.send('Hello World!~~ 안녕하세요~~'))

// app이 포트번호 5000번에서 실행
app.listen(port, () => console.log(`Example app listening on port ${port}!`))

