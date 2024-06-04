const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config()
const connect = mongoose.connect(process.env.DATABASE_KEY)

//check database connected or not
connect.then(()=>{
    console.log("Database Connected Successfully!");
})
.catch(()=>{
    console.log("Database is not connected!");
})

// create a schema
const registerSchema = new mongoose.Schema({
    userName:{
        type:String,
        required:true
    },
    googleId:{
        type:String
    },
    phoneNo:{
        type:Number,
        // required:true
    },
    emailAddress:{
        type:String,
        required:true
    },
    password:{
        type:String,
        // required:true
    },
    isAdmin:{
        type:Boolean,
        default:false
    },
    added:{
        type:Date,
        default:Date.now
    },
    status:{
        type:Boolean,
        default:true
    },
    image:{
        type: Array
    },
    logged:{
        type:Boolean,
        default:false
    }

})



//collection part
const registerCollection = new mongoose.model("userRegister",registerSchema);

module.exports = registerCollection;