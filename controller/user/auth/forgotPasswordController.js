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


const sendEmailOtp = (req, res) => {
    res.render('user/sendEmailOtp', { message: '' })
}

const postsendEmailOtp = async (req, res) => {
    try {
        globalUser.emailAddress = req.body.emailAddress
        const emailAddress = globalUser.emailAddress
        const checkUserPresent = await userModel.findOne({ emailAddress });
        console.log(checkUserPresent);
        if (checkUserPresent) {
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            })
            let result = await otpModel.findOne({ otp: otp });
            while (result) {
                otp = otpGenerator.generate(6, {
                    upperCaseAlphabets: false,
                });
                result = await otpModel.findOne({ otp: otp });
            }
            const otpPayload = { emailAddress, otp };
            await otpModel.create(otpPayload);
            res.redirect('/forgotEnterOtp')
        } else {
            res.render('user/sendEmailOtp', { message: 'User not found !' })
        }

    } catch (error) {
        console.log('connection Error : ', error);
    }
}

const forgotEnterOtp = (req, res) => {
    res.render('user/forgotEnterOtp', { message: '' })
}

const postForgotEnterOtp = async (req, res) => {
    try {
        const emailAddress = globalUser.emailAddress
        const { otp1, otp2, otp3, otp4, otp5, otp6 } = req.body
        const combinedOTP = otp1 + otp2 + otp3 + otp4 + otp5 + otp6;

        const response = await otpModel.find({ emailAddress }).sort({ createdAt: -1 }).limit(1);
        if (response.length === 0 || combinedOTP !== response[0].otp) {
            res.render('user/enterOtp', { message: 'Invalid OTP', timer: '2:00' })
        } else {
            res.redirect('/resetPassword')
        }
    } catch (error) {
        console.log(error)
    }
}

const resetPassword = (req, res) => {
    res.render('user/resetPassword')
}

const createPassword = async (req, res) => {
    try {
        const emailAddress = globalUser.emailAddress
        const password = req.body.password
        const response = await otpModel.find({ emailAddress }).sort({ createdAt: -1 }).limit(1);
        if (response.length === 0 || otp !== response[0].otp) {
            return res.status(400).json({
                success: false,
                message: 'The OTP is not valid',
            });
        }
        const user = await userModel.findOne({ emailAddress });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // // Secure password
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
        user.password = hashedPassword
        await user.save();
        res.render('user/login', { error: 'Reset Password Successful' })
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ success: false, error: error.message });
    }
}

module.exports = {
    postForgotEnterOtp, postsendEmailOtp, sendEmailOtp, forgotEnterOtp,resetPassword,createPassword
}