require("dotenv").config()
const express = require("express")
const cors = require("cors")
const morgan = require("morgan")
const helmet = require("helmet")
const Router = require("./routers")
const { sequelize } = require("./models")
const path = require("path")
const app = express()

// 시퀄라이즈 연결
sequelize
  .sync({ force: false })
  .then(() => {
    console.log("연결 성공")
  })
  .catch((err) => {
    console.error(err)
  })

//미들웨어
app.use(express.json())
app.use(cors())
app.use(helmet())
app.use(morgan("tiny"))
app.use(express.urlencoded({ extended: false }))
app.use(express.static("public"))
app.use(express.static(path.join(__dirname, "public")))

// 라우터
app.use("/", Router)

// 서버 에러 처리
app.use((req, res, next) => {
  const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`)
  error.status = 404
  next(error)
})

app.use((error, req, res) => {
  res.local.message = error.message
  res.local.error = process.env.NODE_ENV !== "production" ? error : {}
  res.status(error.status || 500)
  res.render("error")
})

module.exports = app