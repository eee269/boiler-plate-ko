const mongoose = require('mongoose');

const bcrypt = require('bcrypt');
// salt 를 이용해서 비밀번호를 암호화 해야 함
const saltRounds = 10;  // salt의 자릿수

const jwt = require('jsonwebtoken');


const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true,
        unique: 1
    },
    password: {
        type: String,
        minlength: 5
    },
    lastname: {
        type: String,
        minlength: 50
    },
    role: {
        type: Number,
        default: 0
    },
    image: String,
    token: {
        type: String
    },
    tokenExp: {
        type: Number
    }
})

// save 하기 전에 여기 먼저 수행하고 넘어가자~
userSchema.pre('save', function( next ) {   

    var user = this;    // userSchema를 가리킴

    // 비밀번호가 변경될 때만 암호화 시킨다.
    if(user.isModified('password')) {
        // bcrypt.genSalt(saltRounds, function(err, salt) {
        bcrypt.genSalt(saltRounds, function(err, salt){
            // err가 발생하면 바로 index.js의 require로 감
            if(err) return next(err)

            // bcrypt.hash(myPlaintextPassword, salt, function(err, hash) {
            // myPlaintextPassword: 암호화되지않은 평문 비밀번호 
            //      - userSchema에서 받아오기
            // salt: 위에서 생성된 salt 받아옴
            bcrypt.hash(user.password, salt, function(err, hash){
                if(err) return next(err);

                // 성공하면 user.password에 암호화된 hash 넣어주기
                user.password = hash
                next()
            })
        })
        // 다른 것을 수정할 때는 바로 넘어가기
    } else {
        next()
    }
})

// 메소드 이름은 index.js에 있는 것과 동일하게
userSchema.methods.comparePassword = function(plainPassword, cb) {
    // cb: callback function
    // plainPassword(입력받은 비밀번호)와 암호화된 비밀번호(DB에 있는 비밀번호)가 같은지 체크
    bcrypt.compare(plainPassword, this.password, function(err, isMatch) {
        // login 로직의 2번으로 감
        if(err) return cb(err);
        cb(null, isMatch)
    })

}


userSchema.methods.generateToken = function(cb) {
    var user = this;
    
    // jsonwebtoken을 이용해서 token을 생성하기
    var token = jwt.sign(user._id.toHexString(), 'secretToken')

    // user._id + 'secretToken' = token -> 'secretToken' -> user._id

    // 생성한 토큰을 userSchema에 넣기
    user.token = token
    user.save(function(err, user) {
        if(err) return cb(err);
        cb(null, user)      // err는 없고(null), user 정보만 전달
    })
}


userSchema.statics.findByToken = function(token, cb) {
    var user = this;

    // 토큰을 복호화 한다
    // user._id + 'secretToken' = token
    jwt.verify(token, 'secretToken', function(err, decoded) {
        // 유저 아이디를 이용해서 유저를 찾은 다음,
        // 클라이언트에서 가져온 token과 DB에 보관된 토큰이 일치하는지 확인

        user.findOne({"_id": decoded, "token": token}, function(err, user) {
            if(err) return cb(err);
            err(null, user)
        })
    })
}

const User = mongoose.model('User', userSchema)

module.exports = {User}

