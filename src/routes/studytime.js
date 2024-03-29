require("dotenv").config()
const Studytime = require("../models/studytime")
const User = require("../models/user")
const router = require("express").Router()
const authmiddleware = require("../middlewares/authmiddleware");
const moment = require("moment");

// today,week Start Point
function timeSet() {
  // 1. 현재 날짜정보, 오늘 타임스탬프, 오늘 요일 출력
  const now = new Date();
  const nowTimestamp = now.getTime();
  const nowDay = now.getDay();
  const dayToMs = 24 * 60 * 60 * 1000;

  // 2. 금주 월요일과 어제의 timestamp 출력.
  const [mondayStamp, yesterdayStamp] = [
    nowTimestamp - (nowDay-1) * dayToMs,
    nowTimestamp - dayToMs,
  ];
  
  // 3. 현재시각, 년, 월, 오늘날짜, 어제날짜, 금주 월요일 날짜를 출력.
  const [currentTime, year, month, today, yesterday, monday] = [
    now.getHours(),
    now.getFullYear(),
    `0${now.getMonth() + 1}`.slice(-2),
    `0${now.getDate()}`.slice(-2),
    `0${new Date(yesterdayStamp).getDate()}`.slice(-2),
    `0${new Date(mondayStamp).getDate()}`.slice(-2),
  ];

  let weekStart = `${year}-${month}-${monday}T00:00:00.000Z`;
  let todayStart;
  currentTime < 24 //한국시간 기준으로 한것!! 삼항쓸필요는 없는데 안바꿔놓음
    ? (todayStart = `${year}-${month}-${today}T00:00:00.000Z`)
    : (todayStart = `${year}-${month}-${yesterday}T00:00:00.000Z`);

    // currentTime < 9 //UTC시간이라서 변경한거임!! (삼항연산자사용!!)..... 
    // ? (todayStart = `${year}-${month}-${yesterday}T00:00:00.000Z`)
    // : (todayStart = `${year}-${month}-${today}T00:00:00.000Z`); 

  return { todayStart, weekStart };
}

// 시간변환
function changeTime(time) {
  let seconds = parseInt((time/1000)%60)
      , minutes = parseInt((time/(1000*60))%60)
      , hours = parseInt((time/(1000*60*60))%24);

  hours = (hours < 10) ? "0" + hours : hours;
  minutes = (minutes < 10) ? "0" + minutes : minutes;
  seconds = (seconds < 10) ? "0" + seconds : seconds;

  return hours + ":" + minutes + ":" + seconds;
}

// 타이머Start
router.post('/timestart', authmiddleware, async (req,res, next) => {
  const { userId } = res.locals.user;
  const { timestart }= req.body;

  try {
    if(timestart === 1) {
    const startTime = moment().format('YYYY-MM-DD HH:mm:ss');
    const now = new Date();
    const day = now.getDay();
    const inTimestamp = now.getTime();
    console.log(startTime, day, inTimestamp)
    const start = await Studytime.create({userId,startTime,day,inTimestamp})
    console.log(start)
    res.status(200).send({
      result: true,
      message: "스터디시작!",
      start,
  })
    return;
  } 
  } catch (error) {
    res.status(400).send({
      result: false,
      message: error.message,
  });
  }
});

// 타이머Out
router.post('/timeout', authmiddleware, async (req,res, next) => {
  const { userId } = res.locals.user;
  const { timeout }= req.body;

  try {
    if(timeout === 0) {
    const outTime = moment().format('YYYY-MM-DD HH:mm:ss');
    const now = new Date();
    const day = now.getDay();
    const outTimestamp = now.getTime();
    console.log(outTime)
    const out = await Studytime.create({userId,outTime,day,outTimestamp})
    console.log(out)
    res.status(200).send({
      result: true,
      message: "스터디끝!",
      out,
  })
    return;
  } 
  } catch (error) {
    res.status(400).send({
      result: false,
      message: error.message,
  });
  }
});

// 화상스터디방 나가기( 이때 공부시간 데이터 값을 저장시켜 주자!!)

router.put('/exit', authmiddleware, async (req,res,next) => {
  const { userId } = res.locals.user;
  const { todayStart, weekStart } = timeSet();
  console.log(todayStart, weekStart)
  try{
    const inTime = await Studytime.find({}, {inTimestamp:1})
    const outTime = await Studytime.find({}, {outTimestamp:1})
    const allinTime = inTime.map( intime => intime.inTimestamp ).filter(intime => intime !== undefined);
    const arr_allinTime = allinTime[allinTime.length -1];
    const alloutTime = outTime.map( outtime => outtime.outTimestamp ).filter(outtime => outtime !== undefined);
    const arr_alloutTime = alloutTime[alloutTime.length -1];

    console.log(arr_allinTime) //맨마지막타임스타드
    console.log(arr_alloutTime) //맨마지막타임아웃

    const timedif =  arr_alloutTime - arr_allinTime
    if(arr_alloutTime<arr_allinTime) {
      res.status(200).send({
        result: false,
        message: "타임아웃시간을 눌러주세요"
      })
      return;
    } 
    const finaltime = changeTime(timedif)
    console.log(timedif)
    console.log(finaltime)
    await Studytime.updateOne({outTimestamp: arr_alloutTime }, {$set:{studytime : finaltime, timedif: timedif}});
    await Studytime.updateOne({inTimestamp: arr_allinTime }, {$set:{studytime : finaltime, timedif: timedif}});
   
    // TotalstudyTime
    const today = new Date(todayStart);
    // +1은 다음날을 기준으로 하기위해서 한것이고 -9시간은 UTC와 KRA 시간이 달라서 조정하기 위해 뺀것!!
    const tommorownum = today.getTime() + 24*60*60*1000 - 9*60*60*1000; 
    console.log(tommorownum)
    console.log(tommorownum - arr_allinTime);
    // todayStart,weekStart 이용
    const today1 = today.getTime() - 9*60*60*1000;
    const d = await Studytime.find({ inTimestamp:{$gt:today1,$lt:tommorownum}})
    // console.log(d.map(x=> x.timedif))
    // console.log(d.map(x=> x.studytime))
    const e = d.map(x=> x.timedif)
    let sum = 0;
    for(let i = 0; i< e.length; i++) {
      sum += e[i]
    } console.log(changeTime(sum))

    await Studytime.updateOne({outTimestamp: arr_alloutTime }, {$set:{studytime:changeTime(sum)}});
    await Studytime.updateOne({inTimestamp: arr_allinTime }, {$set:{studytime:changeTime(sum)}});

    res.status(200).send({
      result: true,
      message: "공부시간이 저장되었습니다.",
      studytime: finaltime,
      todayrecord : changeTime(sum)
  });

  } catch (error) {
    console.log(error)
    res.status(400).send({
      result: false,
      message: error.message,
  });
  }
});

// Study Time,day 조회
router.get('/', authmiddleware, async (req,res, next) => {
  const { userId } = res.locals.user;
  const { todayStart, weekStart } = timeSet();
  console.log(todayStart, weekStart)
  try{
    const inTime = await Studytime.find({}, {inTimestamp:1})
    const outTime = await Studytime.find({}, {outTimestamp:1})
    const allinTime = inTime.map( intime => intime.inTimestamp ).filter(intime => intime !== undefined);
    const arr_allinTime = allinTime[allinTime.length -1];
    const alloutTime = outTime.map( outtime => outtime.outTimestamp ).filter(outtime => outtime !== undefined);
    const arr_alloutTime = alloutTime[alloutTime.length -1];

    console.log(arr_allinTime)
    console.log(arr_alloutTime)

    const timedif =  arr_alloutTime - arr_allinTime
    console.log(timedif)
    
    const user = await Studytime.find({ userId })
    const day = user.filter(function(x) { return x.inTimestamp}).map(x=>x.day)
    const days = day[day.length-1];

    // TotalstudyTime
    const today = new Date(todayStart);
    // +1은 다음날을 기준으로 하기위해서 한것이고 -9시간은 UTC와 KRA 시간이 달라서 조정하기 위해 뺀것!!
    const tommorownum = today.getTime() + 24*60*60*1000 - 9*60*60*1000; 
    console.log(tommorownum)
    console.log(tommorownum - arr_allinTime);
    // todayStart,weekStart 이용
    const today1 = today.getTime() - 9*60*60*1000;
    const d = await Studytime.find({ inTimestamp:{$gt:today1,$lt:tommorownum}})
    // console.log(d.map(x=> x.timedif))
    // console.log(d.map(x=> x.studytime))
    const e = d.map(x=> x.timedif)
    let sum = 0;
    for(let i = 0; i< e.length; i++) {
      sum += e[i]
    } console.log(changeTime(sum))

    res.status(200).send({
      result: true,
      studytime : changeTime(timedif),
      day : days,
      todayrecord : changeTime(sum)
  })
  } catch (error) {
    res.status(400).send({
      result: false,
      message: error.message,
  });
  }
});


module.exports = router
