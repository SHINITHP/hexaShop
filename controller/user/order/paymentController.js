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


const razorpay = new Razorpay({
    key_id: process.env.RAZORPAYKEY,
    key_secret: process.env.RAZORPAY_SECRET
});

const verifyPayment = async (req, res) => {
    try {
        const payment = req.body.payment
        const order = req.body.order
        let hmac = crypto.createHash('sha256', process.env.RAZORPAYKEY)
        hmac.update(payment.razorpay_order_id + '|' + payment.razorpay_payment_id)
        hmac = hmac.digest('hex')
        if (hmac == payment.razorpay_signature) {
            res.status(200).send('Payment verified successfully.');
        }
    } catch (error) {
        console.log(error)
    }

}

const onlinPayment = async (req, res) => {
    const amount = req.body.amount;
    const paymentData = {
        amount: amount * 100, // Amount in paise (100 paise = 1 INR)
        currency: 'INR',
        receipt: uniqueId,
    };
    try {
        const response = await razorpay.orders.create(paymentData);
        res.json(response);
    } catch (error) {
        console.error('Error creating payment:', error);
        res.status(500).json({ error: 'Failed to create payment' });
    }
}

module.exports = {
    verifyPayment, onlinPayment
}
