const express = require('express')
const app = express()
const port = 3000
const bodyParser = require('body-parser')
const { User } = require('./models/User')

const config = require('./config/key')

app.use(bodyParser.urlencoded({ extended: true })) // application/x-www-form-urlencoded 형식을 처리
app.use(bodyParser.json()) // JSON 형식의 데이터를 처리

const mongoose = require('mongoose')

mongoose
  .connect(config.mongoURI)
  .then(() => console.log('MongoDB 연결 성공'))
  .catch((err) => console.log('MongoDB 연결 실패', err))

app.get('/', (req, res) => res.send('안농'))

app.post('/register', (req, res) => {
  const user = new User(req.body)

  user.save((err, userInfo) => {
    if (err) return res.json({ success: false, err })
    return res.status(200).json({
      success: true,
    })
  })
})

app.listen(port, () => console.log(`안농 ${port}`))
