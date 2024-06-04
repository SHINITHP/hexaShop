const mongoose = require('mongoose');

const AppliedCoupons = new mongoose.Schema({
    userID:{
        type:mongoose.Schema.ObjectId, ref:"userRegister",
    },
    couponCode:{
        type:String
    }
})


module.exports = mongoose.model("appliedCoupon", AppliedCoupons);