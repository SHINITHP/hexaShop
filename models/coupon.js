const mongoose = require('mongoose');

const couponModel = new mongoose.Schema({
    discountAmount:{
        type:Number,
        required:true
    },
    couponCode:{
        type:String,
        required:true
    },
    startDate:{
        type:Date,
        required:true
    },
    Expire:{
        type:Date,
        required:true
    },
    usageLimits:{
        type:Number,
        default:0
    },
    minimumPurchase:{
        type:Number,
        required:true
    },
    maxAmount:{
        type:Number,
        required:true
    },
    status:{
        type:String,
        default:'Listed'
    },
    title:{
        type:String,
        required:true
    }
})


module.exports = mongoose.model("Coupon", couponModel);