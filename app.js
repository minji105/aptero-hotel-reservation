const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

require('dotenv').config();
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PW;
const port = process.env.PORT || 3000;

// MongoDB 연결
mongoose.connect('mongodb+srv://' + dbUser + ':' + dbPassword + '@cluster0.7aje40r.mongodb.net/');
const db = mongoose.connection;

// MongoDB 연결 확인
db.once('open', () => {
    console.log('MongoDB connected');
});

// MongoDB 연결 실패 시 에러 메시지 출력
db.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

// MongoDB 스키마 정의
const reservationSchema = new mongoose.Schema({
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    roomType: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
});

// MongoDB 모델 생성
const Reservation = mongoose.model('Reservation', reservationSchema);

// Express 설정
// app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// 뷰 엔진 설정
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './views/index.html'));
});

// 루트 엔드포인트
app.post('/reserve', async (req, res) => {
    console.log(req.body);  // 디버깅용
    const { checkIn, checkOut, rooms, name, phone } = req.body;

    try {
        const reservation = new Reservation({
            checkIn: checkIn,
            checkOut: checkOut,
            roomType: rooms,
            name: name,
            phone: phone,
        });

        await reservation.save(); // await를 사용하여 프로미스를 기다림

        console.log('Reservation saved:', reservation);
        res.redirect(`/confirmation?checkIn=${checkIn}&checkOut=${checkOut}&roomType=${rooms}&name=${name}&phone=${phone}`);
    } catch (err) {
        console.error('Error saving reservation:', err);
        res.status(500).json({ error: 'Error saving reservation' });
    }
});

app.get('/confirmation', (req, res) => {
    // URL에서 쿼리 파라미터를 읽어와서 템플릿에 전달
    const { checkIn, checkOut, roomType, name, phone } = req.query;
    res.render('confirmation', { checkIn, checkOut, roomType, name, phone, url: req.originalUrl });
});


app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

