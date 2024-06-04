const express = require('express')
const router = express.Router()
const {
    adminLogin, adminLoginPost, productList, productListEdit,
    addProductsPost, adminDashboard, CustomerDetails, categoryPost,
    categoryEdit, updateUser, productSearch, Category, postAddCategory,
    postEditProduct, logout,CustomerFilter,deleteInventory,filterCategory,
    orderHistory,OrderTasks,messageBox,updateRequest,coupon,couponTasks,salesReport,
    offers,salesFilter,offerTasks,editOffer,DeleteOffer,deletCoupon,DashboardSales
} = require('../../controller/admin/adminController.js')
const upload = require('../../controller/admin/multer.js')
const adminAuth = require('../../middlewares/adminMiddleware.js')


router.route('/').get( adminLogin).post(adminLoginPost)//loginpage page
router.route('/adminDashboard').get(adminAuth,adminDashboard)//dashboard page
router.route('/adminDashboard/sales').get(adminAuth,DashboardSales)
router.route('/ProductList').get(adminAuth,productList).post(productListEdit)//productlist page
router.route('/ProductList/addProducts').get(adminAuth,productList).post(addProductsPost)//addProducts page
router.route('/editProducts').get(adminAuth, productList).put(postEditProduct).delete(postEditProduct)
router.route('/deleteInventory').delete(deleteInventory)
router.route('/CustomerDetails').get(adminAuth,CustomerDetails).patch(updateUser)//customer page//CustomerFilter//listed and unlisted incustomer page
router.route('/CustomerFilter').get(adminAuth,CustomerFilter)
router.route('/ProductList/search').post(productSearch)//productlist search par
router.route('/Category').get(adminAuth,Category).patch(categoryPost)//category page
router.route('/Category/:id').get(adminAuth,Category).put(upload.array('images'), categoryEdit)//editCategory page images3
router.route('/addCategory').get(adminAuth,Category).post(upload.array('images'), postAddCategory)//addcategory page
router.route('/filterCategory').get(adminAuth,filterCategory)
router.route('/adminLogout').get(logout)//logout
router.route('/orderHistory').get(adminAuth,orderHistory).patch(OrderTasks)
router.route('/messageBox').get(adminAuth,messageBox).patch(updateRequest)
router.route('/coupon').get(adminAuth,coupon).post(couponTasks).patch(couponTasks).delete(deletCoupon)
router.route('/salesReport').get(adminAuth,salesReport).post(salesFilter)
router.route('/offers').get(adminAuth,offers).post(offerTasks).patch(editOffer).delete(DeleteOffer)
module.exports = router  