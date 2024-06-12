const express = require('express')
const router = express.Router()
const { adminLogin, adminLoginPost,adminDashboard,logout,deleteInventory,messageBox,updateRequest,dashboardSales } = require('../../controller/admin/adminController.js')
const { productList,productListEdit,addProductsPost,postEditProduct,productSearch } = require('../../controller/admin/productController.js')
const { category, categoryPost, categoryEdit, postAddCategory,filterCategory } = require('../../controller/admin/categoryController.js')
const { coupon, couponTasks, deletCoupon,offers,offerTasks,editOffer,deleteOffer } = require('../../controller/admin/discountController.js')
const { customerDetails, updateUser,customerFilter } = require('../../controller/admin/customerController.js')
const { salesReport } = require('../../controller/admin/salesController.js')
const { orderTasks,orderHistory } = require('../../controller/admin/orderController.js')
const upload = require('../../utils/multer.js')
const adminAuth = require('../../middlewares/adminMiddleware.js')


router.route('/').get(adminLogin).post(adminLoginPost)//loginpage page
router.route('/adminDashboard').get(adminAuth,adminDashboard)//dashboard page
router.route('/adminDashboard/sales').get(adminAuth,dashboardSales)
router.route('/ProductList').get(adminAuth,productList).post(productListEdit)//productlist page
router.route('/ProductList/addProducts').get(adminAuth,productList).post(addProductsPost)//addProducts page
router.route('/editProducts').get(adminAuth, productList).put(postEditProduct).delete(postEditProduct)
router.route('/deleteInventory').delete(deleteInventory)
router.route('/CustomerDetails').get(adminAuth,customerDetails).patch(updateUser)//customer page//CustomerFilter//listed and unlisted incustomer page
router.route('/CustomerFilter').get(adminAuth,customerFilter)
router.route('/ProductList/search').post(productSearch)//productlist search par
router.route('/Category').get(adminAuth,category).patch(categoryPost)//category page
router.route('/Category/:id').get(adminAuth,category).put(upload.array('images'), categoryEdit)//editCategory page images3
router.route('/addCategory').get(adminAuth,category).post(upload.array('images'), postAddCategory)//addcategory page
router.route('/filterCategory').get(adminAuth,filterCategory)
router.route('/adminLogout').get(logout)//logout
router.route('/orderHistory').get(adminAuth,orderHistory).patch(orderTasks)
router.route('/messageBox').get(adminAuth,messageBox).patch(updateRequest)
router.route('/coupon').get(adminAuth,coupon).post(couponTasks).patch(couponTasks).delete(deletCoupon)
router.route('/salesReport').get(adminAuth,salesReport)
router.route('/offers').get(adminAuth,offers).post(offerTasks).patch(editOffer).delete(deleteOffer)
module.exports = router  