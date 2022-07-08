const mongoose = require("mongoose");

const { Schema } = mongoose;
const studyTimeSchema = new Schema({
    studytime : {
        type: String,
    },
    userId: {
        type: Number,
    },
    startTime : {
        type: String,
    },
    outTime : {
        type: String,
    },
    day : {
        type: Number,
    },
    inTimestamp : {
        type: Number,
    },
    outTimestamp: {
        type: Number,
    },
    timedif: {
        type: Number,
    },
    // weekTime: {
    //     type: Number,
    // }
});



module.exports = mongoose.model("studyTime", studyTimeSchema);
