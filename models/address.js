const mongoose = require('mongoose');

const addressModel = new mongoose.Schema({
    userID:{
        type:mongoose.Schema.ObjectId,ref:"userRegister",
        required:true
    },
    fullName:{
        type:String,
        required:true
    },
    emailAddress:{
        type:String,
        required:true
    },
    phoneNo:{
        type:Number,
        required:true
    },
    gender:{
        type:String,
        required:true
    },
    cityDistrictTown:{
        type:String,
        required:true
    },
    state:{
        type:String,
        required:true
    },
    country:{
        type:String,
        required:true
    },
    pincode:{
        type:String,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    addressType:{
        type:String,
        required:true
    },
    selected:{
        type:Boolean,
        default:false
    }

})


module.exports = mongoose.model("userAddress", addressModel);