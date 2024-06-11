const UserModel = require('../../models/register.js')//user schema
const ProductModel = require('../../models/products.js')//product schema
const subCategorySchema = require('../../models/category.js')//category schema
const walletSchema = require('../../models/wallet.js')//wallet schema
const couponSchema = require('../../models/coupon.js')//coupon schema
const offerSchema = require('../../models/offer.js')//offer schema
const orderSchema = require('../../models/order.js')//order schema
const { insertMany } = require('../../models/address.js')//address schema
const bcrypt = require('bcrypt')
const cloudinary = require('../../utils/cloudinary.js')
const fs = require('fs')
const jwt = require('jsonwebtoken');
const path = require('path')
const mongoose = require('mongoose');
require('dotenv').config()
var pdf = require("pdf-creator-node");
const { triggerAsyncId } = require('async_hooks')
const { json } = require('body-parser')
const MaxExpTime = 3 * 24 * 60 * 60 // expire in 3days
const { randomToken, generateSimpleUniqueId } = require('../../utils/functions.js')



//productlist get method
const productList = async (req, res) => {
    if (req.path === '/ProductList') {
        const productDetails = await ProductModel.find({})
        res.render('admin/ProductList', { productDetails, message: ' ' })
    }
    else if (req.path === '/ProductList/addProducts') {
        const subCategory = await subCategorySchema.distinct('subCategory');
        // console.log(subCategory);
        res.render('admin/addProducts', { subCategory, success: '' })
    }
    else if (req.path === '/editProducts') {
        const subCategory = await subCategorySchema.distinct('subCategory');
        const productInfo = await ProductModel.findById(req.query.id)
        // console.log(productInfo);
        res.render('admin/editProducts', { subCategory, productInfo, success: '' })
    }

}


module.exports = {
    productList
}