const mongoose = require('mongoose');

const subCategorySchema = new mongoose.Schema({
    CategoryName:{
        type:String,
        required:true
    },
    subCategory:{
        type:String,
        required:true
    },
    image:{
        type:Array,
        required:true
    },
    added: {
        type: Date,
        default: Date.now
    },
    Inventory:{
        type:String,
        required:true,
        default:"Listed"
    }
})

module.exports = mongoose.model("subCategory", subCategorySchema);