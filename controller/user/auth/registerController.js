const userModel = require('../../../models/register.js')
const addressModel = require('../../../models/address.js')
const addtToCartModel = require('../../../models/cart.js')
const appliedCoupon = require('../../../models/AppliedCoupon.js')
const subCategorySchema = require('../../../models/category.js')
const couponModel = require('../../../models/coupon.js')
const orderSummary = require('../../../models/orderSummary.js')
const orderSchema = require('../../../models/order.js')
const otpModel = require('../../../models/otp.js')
const walletSchema = require('../../../models/wallet.js')
const wishlistSchema = require('../../../models/wishlist.js')
const productModel = require('../../../models/products.js')
const bcrypt = require('bcrypt')
const otpGenerator = require('otp-generator');
const jwt = require('jsonwebtoken');
require('dotenv').config()
const Razorpay = require('razorpay')
const crypto = require('crypto');
const { getUserId, randomToken, generateSimpleUniqueId, generateUniqueFourDigitNumber } = require('../../../utils/functions.js')
const uniqueId = generateSimpleUniqueId();
const pdf = require('html-pdf');
const MaxExpTime = 3 * 24 * 60 * 60
let globalUser = {
    userName: "",
    phoneNo: "",
    emailAddress: "",
    password: ""
  };
  


const registerPage = (req, res) => {
    res.render('user/register')
}

//send OTP for the registration of user 
const sentOTP = async (req, res) => {
    try {
        //requesting the data from the body and assigning that data to a global variable.
        globalUser.userName = req.body.userName
        globalUser.phoneNo = req.body.phoneNo
        globalUser.emailAddress = req.body.emailAddress
        globalUser.password = req.body.password

        const emailAddress = globalUser.emailAddress
        const checkUserPresent = await userModel.findOne({ emailAddress });// Check if user is already present

        if (checkUserPresent) {// If user found with provided email
            return res.status(401).json({
                success: false,
                message: 'User is already registered',
            });
        }
        //generate OTP 
        otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        })
        //just check the otp is correct 
        let result = await otpModel.findOne({ otp: otp });
        while (result) {
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
            });
            result = await otpModel.findOne({ otp: otp });
        }
        //save the otp to the database
        const otpPayload = { emailAddress, otp };
        await otpModel.create(otpPayload);
        res.render('user/enterOtp', { message: '', timer: '2:00' })//render the enterotp page
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ success: false, error: error.message });
    }
}

//show enterOTP for registration
const enterOtp = (req, res) => {
    res.render('user/enterOtp', { message: '', timer: '2:00' })
}

const createUser = async (req, res) => {
    let timer = req.body.Timer;
    console.log(req.body.otp)
    try {
      const emailAddress = globalUser.emailAddress
      const password = globalUser.password
  
      const { otp1, otp2, otp3, otp4, otp5, otp6 } = req.body
      const combinedOTP = otp1 + otp2 + otp3 + otp4 + otp5 + otp6;
      const response = await otpModel.find({ emailAddress }).sort({ createdAt: -1 }).limit(1);
      if (combinedOTP !== response[0].otp) {
        res.render('user/enterOtp', { message: 'Invalid OTP', timer: '2:00' })
      } else {
        let hashedPassword;
        try {
          hashedPassword = await bcrypt.hash(password, 10);
        } catch (error) {
          return res.status(500).json({
            success: false,
            message: `Hashing password error for ${password}: ` + error.message,
          });
        }
        // hash the password
        globalUser.password = hashedPassword
        //store the user data to mongodb
        const createdUser = await userModel.create(globalUser);
        const Token = randomToken(createdUser._id)
        res.cookie('jwtUser', Token, { httpOnly: true, maxAge: MaxExpTime * 1000 });
        res.redirect('/')
      }
  
    } catch (error) {
      res.render('user/enterOtp', { message: 'OTP Time Out', timer: timer })
    }
  }







module.exports = {
    registerPage, createUser,enterOtp,sentOTP
}