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
const MaxExpTime = 60 * 5 


// show login page
const loginPage = (req, res) => {
    res.render('user/login', { error: "" })
}


//post method for login page
const userLogin = (async (req, res) => {
    try {
        const { emailAddress, password } = req.body
        const userExist = await userModel.findOne({ emailAddress: emailAddress });
        //check the user is exist or not
        if (userExist) {
            const isPasswordMatch = await bcrypt.compare(password, userExist.password)
            if (isPasswordMatch) {
                if (userExist.status === true) {
                    const Token = randomToken(userExist._id)
                    console.log(Token)
                    res.cookie('jwtUser', Token, { httpOnly: true, maxAge: MaxExpTime * 1000 });
                    await userModel.findByIdAndUpdate(userExist._id, { $set: { logged: true } })
                    res.redirect('/')
                }
                else {
                    res.render('user/login', { error: "User Blocked!" })
                }
            } else {
                res.render('user/login', { error: "Wrong Password!" })
            }
        } else {
            res.render('user/login', { error: "Entered  Email Address is wrong!" })
        }
    } catch (error) {
        console.log(error);
        res.render('user/login', { error: "Error while login" })
    }
})

const google = (req, res) => {
    try {
        const token = jwt.sign(
            { user: req.user },
            process.env.JWT_SECRET || '',
            { expiresIn: "50h" },
        );
        res.cookie('jwtUser', token);
        res.redirect('/')
    } catch (error) {
        console.log(error)
    }

}


module.exports = {
    loginPage, userLogin, google
}