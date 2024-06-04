const mongoose = require('mongoose');

const wishlistModel = new mongoose.Schema({
    userID: {
        type: mongoose.Schema.ObjectId, 
        ref: "userRegister",
    },
    productID: {
        type: mongoose.Schema.ObjectId, 
        ref: "ProductDetails",
    },
    added:{
        type:Date,
        default:Date.now
    }
})

module.exports = mongoose.model("wishlist", wishlistModel);