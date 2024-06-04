const mongoose = require('mongoose');

const shoppingCartModel = new mongoose.Schema({
    userID:{
        type:mongoose.Schema.ObjectId, ref:"userRegister",
    },
    productID:{
        type:mongoose.Schema.ObjectId,ref:"ProductDetails",
    },
    quantity:{
        type:Number,
        required:true
    },
    totalPrice:{
        type:Number,
        required:true
    },
    totalMRP:{
        type:String
    },
    size:{
        type:String
    },
    color:{
        type:String,
        require:true
    },
})


module.exports = mongoose.model("shoppingCart", shoppingCartModel);