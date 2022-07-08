require("dotenv").config()
const router = require("express").Router();
const authMiddleware = require("../middlewares/authmiddleware")
const User = require("../models/user")
const Bcrypt = require("bcrypt");
const SALT_NUM = process.env.SALT_NUM

// 마이페이지
router.get('/', authMiddleware, async (req, res) => {
    const { user } = res.locals;
    const { userId } = user;
    
    try {
        const myPage = await User.findOne({ userId });
        res.status(200).send({ 
            result: true,
            nickName: myPage.nickname,
            userEmail: myPage.email,
            imgUrl: myPage.profile_url,
        });
    } catch (error) {
        res.status(400).send({
            result: false,
            message: error.message,
        });
    }
});

// 마이페이지수정
router.put('/update', authMiddleware, async (req, res) => {
    const { user } = res.locals;
    const { userId } = user;
    const { nickname, password, passwordCheck, imgUrl } = req.body;
    console.log(user)
    try {
        const myPage = await User.findOne({ userId });
        if (passwordCheck !== password) {
            return res.send({
                result: false,
                message: "비밀번호, 비밀번호 확인이 동일해야 합니다."
            })
        }
        
        const salt = await Bcrypt.genSalt(Number(SALT_NUM))
        const hashPassword = await Bcrypt.hash(password, salt)

        const user = await User.updateOne({ userId }, 
            { $set: { nickname, password:hashPassword , passwordCheck, imgUrl }});

            res.send({
                result: true,
                message: "유저정보가 수정되었습니다.",
                user : user,
        })
    } catch (error) {
        res.status(400).send({
            result: false,
            message: error.message,
        });
    }
});

// // 마이페이지 이미지수정
// router.put('/update/imgUrl', authMiddleware, async (req, res) => {
//     const { user } = res.locals;
//     const { userId } = user;
//     const { imgUrl } = req.body;

//     try {
//         const userImg =await User.updateOne({ userId },
//             { $set: { imgUrl }});
//             res.status(200).send({
//                 result: true,
//                 message: "유저이미지가 수정되었습니다.",
//                 userImg : userImg,
//             })
//     } catch (error) {
//         res.status(400).send({
//             result: false,
//             message: error.message,
//         });
//     }
// });

// 유저찾기

router.get('/search', async (req, res, next) => {
    try {
        const users = await User.find({}, {userId: 1, nickname: 1});
        console.log(users)
            return res.status(200).json({
                result: true,
                users,
        });
    } catch(error) {
        return res.status(400).send({
            result: false,
            msg: "유저정보를 불러올 수 없습니다.",
            msg: error.message,
          })
    }
});

module.exports = router
