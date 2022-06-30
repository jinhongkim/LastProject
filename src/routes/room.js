const {Room} = require("../models/studyroom")
const { Sequelize } = require("sequelize")
const router = require("express").Router()

// 방조회
router.get("/room", (req, res, next) => {
  try {
    const roomList = Room.findAll({
      attributes: "roomId",
      order: "createAt",
    })
  } catch (error) {
    return res.status(400).send({
      success: false,
      msg: "스터디를 불러올 수 없습니다.",
      errmsg: error.message,
    })
  }
})
  
// 방생성
router.post("/room/create", (req, res, next) => {
  try {
  } catch (error) {
    return res.status(400).send({
      success: false,
      msg: "스터디를 생성하지 못했습니다.",
      errmsg: error.message,
    })
  }
})
// 방입장
router.post("/room/enter-room/:password", (req, res, next) => {
  try {
  } catch (error) {
    return res.status(400).send({
      success: false,
      msg: "스터디에 입장할 수 없습니다.",
      errmsg: error.message,
    })
  }
})
// 방삭제
router.delete("/room/remove/:email/:password", (req, res, next) => {
  try {
  } catch (error) {
    return res.status(400).send({
      success: false,
      msg: "스터디를 삭제할 수 없습니다.",
      errmsg: error.message,
    })
  }
})
// 방나가기
router.get("/room/exit", (req, res, next) => {
  try {
  } catch (error) {
    return res.status(400).send({
      success: false,
      msg: "스터디 나가기에 실패했습니다.",
      errmsg: error.message,
    })
  }
})

module.exports = router