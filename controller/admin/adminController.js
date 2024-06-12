const userModel = require('../../models/register.js')//user schema
const productModel = require('../../models/products.js')//product schema
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
const maxExpTime = 3 * 24 * 60 * 60 // expire in 3days
const { randomToken, generateSimpleUniqueId } = require('../../utils/functions.js')

//..................................................................................................................................................

//Section for GET Request start here.......

//show landing page 
const adminLogin = (req, res) => {
    res.render('admin/adminLogin', { message: "" })
}
//..................................................................................................................................................

// to show the sales chart in dashboard
const dashboardSales = async (req, res) => {
    try {
        const salesDetails = await orderSchema.find()
            .populate('productID')
            .populate('addressID')

        res.json(salesDetails);
    } catch (error) {
        console.log(error)
    }
}
//..................................................................................................................................................

//adminDashboard get method
const adminDashboard = async (req, res) => {

    try {
        const result = await userModel.aggregate([
            { $match: { logged: true } },
            { $count: "loggedInUsersCount" }
        ]);
        const activeUser = result[0].loggedInUsersCount;
        const product = await productModel.find();
        const productCount = product.length;
        const salesDetails = await orderSchema.find()
            .populate('productID')
            .populate('addressID')
        let orderCount, totalSales = 0;
        let categoryCounts = {}, brandCounts = {}, productCounts = {};
        salesDetails.map((val, i) => {
            orderCount = i + 1;
            totalSales += val.Amount;

            const brand = val.productID.BrandName;
            const category = val.productID.CategoryName;
            const product = val.productID.ProductName;

            if (categoryCounts[category] || brandCounts[brand] || productCounts[product]) {
                brandCounts[brand]++;
                productCounts[product]++;
                categoryCounts[category]++;
            } else {
                categoryCounts[category] = 1;
                brandCounts[brand] = 1;
                productCounts[product] = 1;
            }

        })
        const categories = Object.keys(categoryCounts);
        const topTenProducts = Object.keys(productCounts);
        const topTenBrands = Object.keys(brandCounts);
        categories.sort((a, b) => b[1] - a[1]);
        res.render('admin/adminDashboard', {
            salesDetails, orderCount, activeUser,
            totalSales, productCount, categories,
            topTenProducts, topTenBrands, product
        })
    } catch (error) {
        console.log(error)
    }

}
//..................................................................................................................................................

//Logout get Request
const logout = (req, res) => {
    res.clearCookie('jwtAdmin');
    res.redirect('/adminLogin')
}
//..................................................................................................................................................

//adminlogin post method
const adminLoginPost = async (req, res) => {
    try {
        const { emailAddress, Password } = req.body
        const email = process.env.ADMIN_USERNAME;
        const adminPassword = process.env.ADMIN_PASSWORD;
        if (emailAddress == email) {
            if (Password == adminPassword) {
                const Token = randomToken(emailAddress)
                res.cookie('jwtAdmin', Token, { httpOnly: true, maxAge: maxExpTime * 1000 });
                res.redirect('adminLogin/adminDashboard')
            } else {
                res.render('admin/adminLogin', { message: 'Invalid Password!' })
            }
        } else {
            res.render('admin/adminLogin', { message: 'Access Denied' })
        }
    } catch (error) {
        console.log('Error while login : ', error);
        //res.render('user/login', { error: "Error while login" })
    }

}
//..................................................................................................................................................


const addImagesToCloudinary = async (imageUrls) => {
    try {
        for (const imageUrl of imageUrls) {
            const result = await cloudinary.uploads(imageUrl, 'Images');
            // Push the public URL of the uploaded image to the uploadedUrls array
            uploadedUrls.push(result.secure_url);
        }
        return uploadedUrls; // Return array of uploaded image URLs
    } catch (error) {
        console.error('Error uploading images to Cloudinary:', error);
        throw error; // Throw error for further handling
    }
};

//..................................................................................................................................................

//delete products
const deleteInventory = async (req, res) => {
    if (req.query.delete === "Products") {
        if (req.query.id) {
            console.log('imag wsnhjfn ')
            await productModel.findByIdAndDelete(req.query.id)
            const productDetails = await productModel.find({})
            res.render('admin/ProductList', { productDetails, message: 'Product Successfully Deleted' })
        }
    }
    else if (req.query.delete === "Category") {
        if (req.query.id) {
            console.log('imag wsnhjfn ')
            await subCategorySchema.findByIdAndDelete({ _id: req.query.id })
            res.redirect('/adminLogin/Category')
        }
    }
}
//..................................................................................................................................................

const messageBox = async (req, res) => {
    const requestedData = await orderSchema.find({
        $or: [
            { request: true },
            { Status: 'Order Cancelled' },
            { Status: 'Order Returned' },
            { rejected: true },
            { return: true }
        ]
    }).populate('userID').populate('productID');
    // console.log(requestedData)
    res.render('admin/messageBox', { requestedData })
}
//..................................................................................................................................................


const updateRequest = async (req, res) => {
    console.log('i ahem heree..')
    if (req.body.status === 'accept') {
        const data = await orderSchema.findByIdAndUpdate(
            req.body.id,
            { $set: { Status: 'Order Cancelled', request: false, rejected: false } }
        );



        const product = await productModel.findById(data.productID._id)
        const productArray = [product];
        let returnData;
        let updatedProduct = productArray.map((val, index) => {
            console.log(parseFloat(val.StockQuantity) + parseFloat(data.Quantity))
            return returnData = {
                ProductName: val.ProductName,
                BrandName: val.BrandName,
                CategoryName: val.CategoryName,
                StockQuantity: parseFloat(val.StockQuantity) + parseFloat(data.Quantity),
                subCategory: val.subCategory,
                PurchaseRate: val.PurchaseRate,
                SalesRate: val.SalesRate,
                ColorNames: val.ColorNames,
                ProductDescription: val.ProductDescription,
                VATAmount: val.VATAmount,
                MRP: val.MRP,
                ProductSize: [
                    {
                        size: val.ProductSize[0].size,
                        quantity: data.Size === val.ProductSize[0].size ? val.ProductSize[0].quantity + data.Quantity : val.ProductSize[0].quantity
                    },
                    {
                        size: val.ProductSize[1].size,
                        quantity: data.Size === val.ProductSize[1].size ? val.ProductSize[1].quantity + data.Quantity : val.ProductSize[1].quantity
                    },
                    {
                        size: val.ProductSize[2].size,
                        quantity: data.Size === val.ProductSize[2].size ? val.ProductSize[2].quantity + data.Quantity : val.ProductSize[2].quantity
                    },
                    {
                        size: val.ProductSize[3].size,
                        quantity: data.Size === val.ProductSize[3].size ? val.ProductSize[3].quantity + data.Quantity : val.ProductSize[3].quantity
                    },
                    {
                        size: val.ProductSize[4].size,
                        quantity: data.Size === val.ProductSize[4].size ? val.ProductSize[4].quantity + data.Quantity : val.ProductSize[4].quantity
                    }

                ],
                files: val.files,
                Inventory: val.Inventory,
                Added: val.Added,
                SI: val.SI

            }
        })

        const checkWallet = await walletSchema.findOne({ userID: data.userID }).sort({ added: -1 });

        const balance = checkWallet ? checkWallet.balance + data.Amount : data.Amount;

        const walletData = {
            userID: data.userID,
            productID: data.productID,
            orderID: req.body.id,
            balance: balance,
            transaction: 'Credit'
        }


        await productModel.findByIdAndUpdate(data.productID._id, updatedProduct[0], { new: true });

        // console.log('checkWallet',checkWallet)

        console.log('walletData', walletData)
        await walletSchema.create(walletData)


        res.redirect('admin/messageBox')

    } else if (req.body.status === 'reject') {
        await orderSchema.findByIdAndUpdate(
            req.body.id,
            { $set: { rejected: true, request: false } }
        );
        res.redirect('admin/messageBox')
    } else if (req.body.status === 'returnAccepted') {
        const data = await orderSchema.findByIdAndUpdate(
            req.body.id,
            { $set: { return: false, Status: 'Order Returned' } }
        );
        // 


        const product = await productModel.findById(data.productID._id)
        const productArray = [product];
        let returnData;
        console.log('productArray :', data.Quantity)
        let updatedProduct = productArray.map((val, index) => {
            console.log(parseFloat(val.StockQuantity) + parseFloat(data.Quantity))
            return returnData = {
                ProductName: val.ProductName,
                BrandName: val.BrandName,
                CategoryName: val.CategoryName,
                StockQuantity: parseFloat(val.StockQuantity) + parseFloat(data.Quantity),
                subCategory: val.subCategory,
                PurchaseRate: val.PurchaseRate,
                SalesRate: val.SalesRate,
                ColorNames: val.ColorNames,
                ProductDescription: val.ProductDescription,
                VATAmount: val.VATAmount,
                MRP: val.MRP,
                ProductSize: [
                    {
                        size: val.ProductSize[0].size,
                        quantity: data.Size === val.ProductSize[0].size ? val.ProductSize[0].quantity + data.Quantity : val.ProductSize[0].quantity
                    },
                    {
                        size: val.ProductSize[1].size,
                        quantity: data.Size === val.ProductSize[1].size ? val.ProductSize[1].quantity + data.Quantity : val.ProductSize[1].quantity
                    },
                    {
                        size: val.ProductSize[2].size,
                        quantity: data.Size === val.ProductSize[2].size ? val.ProductSize[2].quantity + data.Quantity : val.ProductSize[2].quantity
                    },
                    {
                        size: val.ProductSize[3].size,
                        quantity: data.Size === val.ProductSize[3].size ? val.ProductSize[3].quantity + data.Quantity : val.ProductSize[3].quantity
                    },
                    {
                        size: val.ProductSize[4].size,
                        quantity: data.Size === val.ProductSize[4].size ? val.ProductSize[4].quantity + data.Quantity : val.ProductSize[4].quantity
                    }

                ],
                files: val.files,
                Inventory: val.Inventory,
                Added: val.Added,
                SI: val.SI

            }
        })
        const checkWallet = await walletSchema.findOne({ userID: data.userID }).sort({ added: -1 });
        const balance = checkWallet ? checkWallet.balance + data.Amount : data.Amount;
        const walletData = {
            userID: data.userID,
            productID: data.productID,
            orderID: req.body.id,
            balance: balance,
            transaction: 'Credit'
        }
        await productModel.findByIdAndUpdate(data.productID._id, updatedProduct[0], { new: true });
        await walletSchema.create(walletData)
        res.redirect('admin/messageBox')
    } else if (req.body.status === 'returnRejected') {
        await orderSchema.findByIdAndUpdate(
            req.body.id,
            { $set: { return: false, rejected: true } }
        );
    }

}
//Section for Post Method End here.....
//.................................................................................................................................................


module.exports = {
    adminLogin,updateRequest,adminLoginPost,deleteInventory,adminDashboard,logout,messageBox,dashboardSales
}