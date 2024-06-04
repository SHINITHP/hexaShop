const mongoose = require('mongoose');

const walletModel = new mongoose.Schema({
    userID: {
        type: mongoose.Schema.ObjectId, 
        ref: "userRegister",
    },
    productID: {
        type: mongoose.Schema.ObjectId, 
        ref: "ProductDetails",
    },
    orderID:{
        type: mongoose.Schema.ObjectId, 
        ref: "OrderDetails",
    },
    balance: {
        type: Number,
        default: 0
    },
    transaction:{
        type:String,
        required:true
    },
    added:{
        type:Date,
        default:Date.now
    },
})

module.exports = mongoose.model("wallet", walletModel);