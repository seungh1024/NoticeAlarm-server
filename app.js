const express = require('express');
const cookieparser = require('cookie-parser');
const morgan =require('morgan');
const path = require('path');
const session = require('express-session');
const dotenv = require('dotenv');
dotenv.config();


//라우터 연결
// const userRouter = require();

const {sequelize} = require('./models');//db모델 서버에 연결하기 위해서 사용함

const app = express();
app.set('port',process.env.PORT || 8001);

sequelize.sync({force:true})
    .then(()=>{
        console.log('데이터베이스 연결 성공');
    })
    .catch(()=>{
        console.error(err);
    });
//index.js에서 db를 불러와서 sync메서드를 사용해 서버 실행 시 MYSQL과 연동되는 것
//force:false 옵션을 true로 설정하면 서버 실행 시마다 테이블을 재생성함
//테이블 잘못 만든 경우에 true로 설정함

app.use(morgan('dev'));//요청과 응답에 대한 정보를 콘솔에 기록하기위해 morgan사용
//dev 외에 combined(배포할 때 많이 사용),common,short,tiny 등이 있음
app.use(express.static(path.join(__dirname,'public')));
//static 미들웨어는 정적인 파일들을 제공하는 라우터 역할
//기본제공 되므로 express객체 안에서 꺼내서 사용
//app.use('요청경로',express.static('실제경로'));

// const{swaggerUi, specs} = require('./swagger/swagger');
// app.use('/api-docs',swaggerUi.serve, swaggerUi.setup(specs));
//api명세를 위해 스웨거를 사용함


app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cookieparser(process.env.COOKIE_SECRET));
app.use(session({
    resave:false,
    saveUninitialized:false,
    secret:process.env.COOKIE_SECRET,
    cookie:{
        httpOnly:true,
        secure:false,
    },
}));




//라우터 분기
// app.use(,);

//404 error
app.use((req,res,next)=>{
    const error = new Error(`${req.method} ${req.url}라우터가 없습니다.`);
    error.status = 404;
    next(error);
});

//500 error
app.use((err,req,res,next)=>{
    res.locals.message = err.message;
    res.locals.error = process.env.NODE_ENV !== 'production'? err:{};
    res.status(err.status || 500);
});

app.listen(app.get('port'),()=>{
    console.log(app.get('port'),'번 포트에서 대기 중');
});