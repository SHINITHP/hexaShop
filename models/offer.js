const mongoose = require('mongoose');

const offerModel = new mongoose.Schema({
    productID: [{
        type: mongoose.Schema.ObjectId,
        ref: "ProductDetails",
        required: true
    }],
    categoryID:{
        type:String,
        required:true
    },
    title:{
        type:String,
        required:true
    },
    percentage:{
        type:Number,
        required:true
    },
    status:{
        type:String,
        default:'Listed'
    }

})


module.exports = mongoose.model("Offer", offerModel);