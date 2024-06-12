const express = require('express')
const router = express.Router()
const {
    logout, profile, profileMenu, shoppingCart,updateCart,saveUserAddress,resendOtp,
    orderDetails, updateProfile,deleteData,profileTasks,generatePDF
} = require("../../controller/user/userConroller.js");
const { loginPage,userLogin,google } = require('../../controller/user/auth/loginController.js')
const { postForgotEnterOtp,postsendEmailOtp,sendEmailOtp,forgotEnterOtp,resetPassword,createPassword } = require('../../controller/user/auth/forgotPasswordController.js')
const { registerPage, createUser,enterOtp,sentOTP } = require('../../controller/user/auth/registerController.js')
const { checkOut,checkOutTasks,updateCheckout } = require('../../controller/user/order/orderController.js')
const { verifyPayment,onlinPayment } = require('../../controller/user/order/paymentController.js')
const { landingPage,productOverview,overviewFilter,priceFilter,allProductFilter,filterProducts,removeCartProduct } = require('../../controller/user/product/productController.js')
const { userAuth } = require('../../middlewares/authMiddleware.js')
const passport = require('passport')
require('../../utils/googleOuath.js')
const { loginAuth } = require('../../middlewares/loginMiddleware.js')


router.route('/').get(landingPage)//landinglage 
router.route('/generate-invoice').post(generatePDF)
router.route('/register').get(registerPage).post(sentOTP)//user registration 
router.route('/enterOtp').get(userAuth,enterOtp).post(createUser)//enterOtp
router.route('/login').get(loginAuth,loginPage).post(userLogin)//loginpage
router.route('/google').get(passport.authenticate('google', { scope: ['profile', 'email'] }))
router.route('/google/redirect').get(passport.authenticate('google'), google)
router.route('/shoppingcart').get(userAuth, shoppingCart).post(orderDetails).patch(updateCart).delete(removeCartProduct)//shoppingcart 
router.route('/sendEmailOtp').get(sendEmailOtp).post(postsendEmailOtp)//enter email page to send otp for forgotpassword
router.route('/forgotEnterOtp').get(forgotEnterOtp).post(postForgotEnterOtp)// Enter otp for forgotpassword
router.route('/resetPassword').get(resetPassword).patch(createPassword)// resetpassword page
router.route('/resendOtp').post(resendOtp)//resend otp 
router.route('/productOverview').get(productOverview).post(userAuth,overviewFilter).delete(overviewFilter)//productOverview 
router.route('/allProducts').get(landingPage).post(priceFilter)//allProducts
router.route('/allProductFilter').get(allProductFilter)
router.route('/filterProducts').get(filterProducts)
router.route('/filterCategory').get(landingPage)//listCategory
router.route('/Profile').get(userAuth, profile).post(profileTasks).patch(updateProfile)
router.route('/checkOut').get(userAuth, checkOut).post(checkOutTasks).put(updateCheckout)
router.route('/logout').get(logout)//logout
router.route('/profileMenu').get(userAuth,profileMenu).post(userAuth,saveUserAddress).put(saveUserAddress).delete(deleteData)
router.route('/create-payment').post(userAuth,onlinPayment)
router.route('/verify-Payment').post(verifyPayment)
module.exports = router