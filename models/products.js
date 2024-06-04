const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);


const productSchema = new mongoose.Schema({
    ProductName: {
        type: String,
        required: true
    },
    BrandName: {
        type: String,
        required: true
    },
    CategoryName: {
        type: String,
        required: true
    },
    StockQuantity: {
        type: String,
        required: true
    },
    subCategory:{
        type: String,
        required: true
    },
    PurchaseRate: {
        type: String,
        required: true
    },
    SalesRate: {
        type: String,
        required: true
    },
    ColorNames: {
        type: String,
        required: true
    },
    ProductDescription: {
        type: String,
        required: true
    },
    VATAmount: {
        type: String,
        required: true
    },
    MRP: {
        type: String,
        required: true
    },
    ProductSize: [
        {
            size: {
                type: String,
                required: true
            },
            quantity: {
                type: Number,
                required: true
            }
        }
    ],
    files: {
        type: Array,
        required:true
    },
    Added: {
        type: Date,
        default: Date.now
    },
    Inventory:{
        type:String,
        required:true,
        default:"Listed"
    },
    offer:{
        type:Number,
        default:0
    }

})


productSchema.plugin(AutoIncrement, { inc_field: 'SI' });

module.exports = mongoose.model("ProductDetails", productSchema);