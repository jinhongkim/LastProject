const {Room} = require("../models")
const {User} = require("../models")
const authMiddleware = require("../middlewares/authmiddleware")
const router = require("express").Router()

// 방조회
router.get("/rooms", async (req, res, next) => {
  try {
    const roomList = await Room.find({}).sort({ createAt: -1 })
    return res.status(201).send({
      result: true,
      roomList,
    })
  } catch (error) {
    return res.status(400).send({
      result: false,
      msg: "스터디를 불러올 수 없습니다.",
      errmsg: error.message,
    })
  }
})
// 호스트 / 참여중 
 
// 방생성
router.post("/create", authMiddleware, async (req, res, next) => {
  try {
    const { roomId, tagName, title, content, password, date } = req.body
    const newStudyRoom = await Room.create({
      roomId,
      tagName,
      title,
      content,
      password,
      date,
    })
    return res
      .status(201)
      .send({ msg: "스터디룸을 생성하였습니다.", roomInfo: newStudyRoom })
  } catch (error) {
    return res.status(400).send({
      result: false,
      msg: "스터디를 생성하지 못했습니다.",
      errmsg: error.message,
    })
  }
})

// 공개방 입장
router.post("/public-room/:roomId", authMiddleware, async (req, res, next) => {
  try {
    // 공개방 비공개방
    console.log(res.locals.user)
    const { nickname } = res.locals.user
    return res.status(200).send(`${nickname}님이 입장하셨습니다`)
  } catch (error) {
    return res.status(400).send({
      result: false,
      msg: "스터디에 입장할 수 없습니다.",
      errmsg: error.message,
    })
  }
})

router.post("/private-room/:roomId", authMiddleware, async (req, res, next) => {
  try {
    //비공개방
    const { roomId } = Number(req.params)
    const pass = req.header("password")
    const { nickname } = res.locals.user
    const { password } = req.body
    const passwordCheck = await Room.findOne({ roomId })
    if (passwordCheck.password !== password) {
      return res.status(200).send({ msg: "비밀번호가 틀렸습니다 " })
    }

    return res.status(200).send(`${nickname}님이 입장하셨습니다`)
  } catch (error) {
    return res.status(400).send({
      result: false,
      msg: "스터디에 입장할 수 없습니다.",
      errmsg: error.message,
    })
  }
})

// 방삭제
router.delete("/:roomId", authMiddleware, async (req, res, next) => {
  try {
    // 비밀번호 헤더로 넘기는 방법
    const { roomId } = req.params
    await Room.deleteOne({ roomId })
    return res.json({ result: true, msg: "스터디 룸이 삭제되었습니다." })
  } catch (error) {
    return res.status(400).send({
      result: false,
      msg: "스터디룸 삭제에 실패하였습니다.",
      errmsg: error.message,
    })
  }
})
// 방나가기
router.post("/exit", (req, res, next) => {
  try {
    res.status(201).send({
      result: true,
      msg: "스터디 룸에서 나왔습니다.",
    })
  } catch (error) {
    return res.status(400).send({
      result: false,
      msg: "스터디 나가기에 실패했습니다.",
      errmsg: error.message,
    })
  }
})

// 방 찾기
// router.get("/room/search", (req, res, next) => {
//   const { word } = req.params;
//   const { title } = req.body;
//   let postArr = [];
//   let posts = await Room.find({ title });
//   try {
//     for (let i in posts) {
//       if (posts[i].title.includes(word)) {
//         postArr.push(posts[i]);
//       }
//     }
//     return res.status(200).send(postArr);
//   } catch (error) {
//     return res.status(400).json({ result: false, Message: "찾으시는 스터디가 없습니다." });
//   }
// })


//카테고리 조회 (미완성)
router.get('/tag/:tagId', async (req, res)=> {
  try {
      const { tagId } = req.params
      const tags = await Room.find({ tagId }).sort("-createAt")
      if (!tags) {
          return res.status(400).json({
              success: false,
              msg: "해당 카테고리 방이 존재하지 않습니다."
          })
      }
      res.status(200).json({
          success: true,
          tags,
      })
  } catch (error) {
      console.log(error)
      res.status(400).send({errorMessage: error.message})
  }
})


//참여중인 스터디 조회
router.get('/entered-room', authMiddleware, async (req, res)=> {
  try {
      const { nickname } = res.locals.user
      // const checkUser = await Users.findOne({ nickname })
      const enterRoom = User.find({ roomId }).sort("-createAt")

      if (!nickname === enterRoom.nickname) {
          return res.status(400).json({ success: false, msg: "참여중인 스터디를 찾을 수 없습니다." })
      }
      if (!enterRoom) {
          return res.status(400).json({ success: false, msg: "해당 카테고리 방이 존재하지 않습니다." })
      }
      res.status(200).json({
          success: true,
          enterRoom,
      })
  } catch (error) {
      console.log(error)
      res.status(400).send({ errorMessage: error.message })
  }
})


//호스트중인 스터디 조회
router.get('/host-room', authMiddleware, async (req, res)=> {
  try {
      const { userId } = res.locals.user
      const hostRoom = await User.find({ roomId }).sort("-createAt")

      if (!userId === hostRoom.userId) {
          return res.status(400).json({ success: false, msg: "호스트중인 스터디가 없습니다." })
      }
      if (!hostRoom) {
          return res.status(400).json({ success: false, msg: "스터디를 불러올수없습니다." })
      }
      res.status(200).json({
          success: true,
          hostRoom
      })
  } catch (error) {
      console.log(error)
      res.status(400).send({ errorMessage: error.message })
  }
  
})


//유저 초대하기
router.put('/invite', authMiddleware, async (req, res)=> {
  try {
      const { nickname } = res.locals.user
      const { roomId } = req.body
      const userList = await User.find({ nickname: {$ne: nickname} }).sort("nickname")
                                      //로그인한 나를 제외한 유저목록조회 (이름 순으로 정렬)
      if (!userList) { return res.status(400).json({ success: false, msg: "유저 리스트를 불러올 수 없습니다." })}
      if (userList === nickname) { return res.status(400).json({ success: false, msg: "본인 포함 오류" })}

      const inviteUser = await Room.findOneAndUpdate({ roomId },{ $push: { userNickname: userList.nickname }})
      res.status(200).json({
          success: true,
          inviteUser,
          msg: "초대 완료"
      })
  } catch (error) {
      console.log(error)
      res.status(400).send({ errorMessage: error.message })
  }
  
})



module.exports = router
