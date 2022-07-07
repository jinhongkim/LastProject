const router = require("express").Router()
const authRouter = require("./auth")
const mypageRouter = require("./mypage")
const roomRouter = require("./room")
const todoRouter = require("./todo")
const studytimeRouter = require("./studytime")

router.use('/auth', authRouter)
router.use('/mypage', mypageRouter)
router.use('/room', roomRouter)
router.use('/todo', todoRouter)
router.use('/studytime', studytimeRouter)

module.exports = router
