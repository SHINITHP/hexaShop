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


//show landing page 
const landingPage = async (req, res) => {
    try {
        const subCategories = await subCategorySchema.find({})
        const token = req.cookies.jwtUser; // Assuming token is stored in cookies
        const userID = getUserId(token);
        const wishlist = await wishlistSchema.find({ userID: userID })
        const productID = wishlist.map((val) => val.productID)
        let allProducts = await productModel.find({})
        let brandNames = allProducts.map((val) => val.BrandName)
        let uniqueBrandNames = [...new Set(brandNames)]; //to filter the unique brandNames

        //to show index page:
        if (req.path == '/') {
            try {
                const productData = await productModel.find({})
                res.render('user/index', { productData, userId: '', productID })
            } catch (error) {
                console.log(error)
            }
        } else if (req.query.task == 'showAllPro') {
            const page = req.query.page;
            const perPage = 4;
            let docCount;
            const productData = await productModel.find({})
                .countDocuments()
                .then(documents => {
                    docCount = documents;

                    return productModel.find({})
                        .skip((page - 1) * perPage)
                        .limit(perPage)
                })
                .then(productData => {
                    res.render('user/allProducts', {
                        route: 'allProducts',
                        productData,
                        task: 'showAllPro',
                        category: '',
                        subCategories,
                        uniqueBrandNames,
                        currentPage: page,
                        totalDocuments: docCount,
                        pages: Math.ceil(docCount / perPage)
                    })
                })
        } else if (req.query.task === 'filterCategory') {
            const category = req.query.cat
            const page = req.query.page;
            const perPage = 4;
            let docCount;
            const productData = await productModel.find({ CategoryName: category })
                .countDocuments()
                .then(documents => {
                    docCount = documents;
                    return productModel.find({ CategoryName: category })
                        .skip((page - 1) * perPage)
                        .limit(perPage)
                })
                .then(productData => {
                    res.render('user/allProducts', {
                        route: 'filterCategory',
                        productData,
                        category,
                        subCategories,
                        uniqueBrandNames,
                        currentPage: page,
                        totalDocuments: docCount,
                        pages: Math.ceil(docCount / perPage)
                    })
                })
        } else if (req.query.task == 'search') {
            try {
                if (req.query.cat === '') {
                    let data = req.query.text;
                    const searchText = new RegExp("^" + data, "i")
                    const page = req.query.page;
                    const perPage = 4;
                    let docCount;
                    const productData = await productModel.find({ ProductName: { $regex: searchText } })
                        .countDocuments()
                        .then(documents => {
                            docCount = documents;
                            return productModel.find({ ProductName: { $regex: searchText } })
                                .skip((page - 1) * perPage)
                                .limit(perPage)
                        })
                        .then(productData => {
                            res.render('user/allProducts', {
                                route: 'search',
                                productData,
                                category: '',
                                data,
                                subCategories,
                                uniqueBrandNames,
                                currentPage: page,
                                totalDocuments: docCount,
                                pages: Math.ceil(docCount / perPage)
                            })
                        })
                } else {
                    try {
                        let cat = req.query.cat;
                        let data = req.query.text;
                        const searchText = new RegExp("^" + data, "i")
                        const page = req.query.page;
                        const perPage = 4;
                        let docCount;
                        const productData = await productModel.find({
                            ProductName: { $regex: searchText },
                            CategoryName: { $in: cat }
                        })
                            .countDocuments()
                            .then(documents => {
                                docCount = documents;
                                return productModel.find({
                                    ProductName: { $regex: searchText },
                                    CategoryName: { $in: cat }
                                })
                                    .skip((page - 1) * perPage)
                                    .limit(perPage)
                            })
                            .then(productData => {
                                res.render('user/allProducts', {
                                    route: 'search',
                                    productData,
                                    category: cat,
                                    subCategories,
                                    uniqueBrandNames,
                                    data,
                                    currentPage: page,
                                    totalDocuments: docCount,
                                    pages: Math.ceil(docCount / perPage)
                                })
                            })

                    } catch (error) {
                        console.log(error)
                    }

                }
            } catch (error) {
                console.log(error)
            }

        }
    } catch (error) {
        console.log(error)
    }
}

//product overview page
const productOverview = async (req, res) => {
    try {
        const token = req.cookies.jwtUser; // Assuming token is stored in cookies
        const userID = getUserId(token); // Verify token and get userID 
        const id = req.query.id
        const ProductData = await productModel.find({ _id: id })
        const cart = await addtToCartModel.find({ userID: userID, productID: id })
        const wishListExist = await wishlistSchema.find({ userID: userID, productID: id }, 'productID');
        let isWishlisted = false;
        if (wishListExist.length > 0) {
            isWishlisted = true;
        }
        const productColor = await productModel.find({ ProductName: ProductData[0].ProductName })
        const firstProduct = ProductData[0];
        const CategoryName = firstProduct.CategoryName;
        const relatedItem = await productModel.find({ CategoryName: CategoryName })
        res.render('user/productOverview', { ProductData, relatedItem, productColor, cart, isWishlisted })
    } catch (error) {
        console.log(error)
    }
}


const overviewFilter = async (req, res) => {
    const token = req.cookies.jwtUser; // Assuming token is stored in cookies
    const userID = getUserId(token); // Verify token and get userID

    if (req.query.task === 'addToCart') {
        try {
            const productID = req.body.productID;
            const productData = await productModel.findById(productID)
            const price = req.body.Price;
            const size = req.body.size != undefined ? req.body.size : productData.ProductSize[0].size;
            let quantity = req.body.quantity;

            const data = {
                userID,
                productID,
                quantity,
                totalPrice: price * quantity - req.body.proDiscount * quantity,
                size,
                totalMRP: productData.MRP * quantity
            }
            await addtToCartModel.create(data)
            res.json({ message: 'Success' })
        } catch (error) {
            console.log('Error While save the shoppingCart Data!', error)
        }
    } else if (req.query.task === 'wishlist') {
        console.log('wishlist:', req.body.productID, userID)
        try {
            const details = {
                userID: userID,
                productID: req.body.productID
            }
            console.log(details)
            await wishlistSchema.create(details)
            res.json({ message: 'success' })
        } catch (error) {
            console.log(error)
        }
    } else if (req.query.task === 'Removewishlist') {

        try {
            const productID = req.body.productID

            await wishlistSchema.deleteOne({ productID: productID, userID: userID })
            res.json({ message: 'success' })

        } catch (error) {
            console.log(error)
        }
    }
}


const priceFilter = async (req, res) => {
    let allProducts = await productModel.find({})
    let brandNames = allProducts.map((val) => val.BrandName)
    let uniqueBrandNames = [...new Set(brandNames)];
    if (req.query.task === 'priceFilter') {
        try {
            const subCategories = await subCategorySchema.find({})
            const page = req.query.page;
            const perPage = 4;
            let docCount;
            const minimum = req.body.minimum;
            const maximum = req.body.maximum;
            const brandName = req.body.brandName;
            if (req.query.cat !== '') {
                const productData = await productModel.find({
                    SalesRate: { $gte: minimum, $lte: maximum },
                    CategoryName: req.query.cat,
                    BrandName: brandName
                })
                    .countDocuments()
                    .then(documents => {
                        docCount = documents;

                        return productModel.find({
                            SalesRate: { $gte: minimum, $lte: maximum },
                            CategoryName: req.query.cat,
                            BrandName: brandName
                        })
                            .skip((page - 1) * perPage)
                            .limit(perPage)
                    })
                    .then(productData => {
                        res.render('user/allProducts', {
                            route: 'priceFilter',
                            productData,
                            category: '',
                            subCategories,
                            uniqueBrandNames,
                            currentPage: page,
                            totalDocuments: docCount,
                            pages: Math.ceil(docCount / perPage)
                        })
                    })
            } else {
                console.log('hi')
                const productData = await productModel.find({
                    $or: [
                        { SalesRate: { $gte: minimum, $lte: maximum } },
                        { BrandName: brandName }
                    ]
                })
                    .countDocuments()
                    .then(documents => {
                        docCount = documents;
                        return productModel.find({
                            $or: [
                                { SalesRate: { $gte: minimum, $lte: maximum } },
                                { BrandName: brandName }
                            ]
                        })
                            .skip((page - 1) * perPage)
                            .limit(perPage)
                    })
                    .then(productData => {
                        res.render('user/allProducts', {
                            route: 'priceFilter',
                            productData,
                            category: '',
                            subCategories,
                            uniqueBrandNames,
                            currentPage: page,
                            totalDocuments: docCount,
                            pages: Math.ceil(docCount / perPage)
                        })
                    })
            }
        } catch (error) {
            console.log(error)
        }
    }
}



const allProductFilter = async (req, res) => {
    const subCategories = await subCategorySchema.find({})
    const token = req.cookies.jwtUser; // Assuming token is stored in cookies
    const userID = getUserId(token);
    const wishlist = await wishlistSchema.find({ userID: userID })
    const productID = wishlist.map((val) => val.productID)
    let allProducts = await productModel.find({})
    let brandNames = allProducts.map((val) => val.BrandName)
    let uniqueBrandNames = [...new Set(brandNames)];
    const sortOrder = req.query.sortOrder === 'LowToHigh' ? 1 : -1;
    const page = req.query.page;
    const perPage = 4;
    let docCount;
    const productData = await productModel.find({}).sort({ SalesRate: sortOrder })
        .countDocuments()
        .then(documents => {
            docCount = documents;

            return productModel.find({}).sort({ SalesRate: sortOrder })
                .skip((page - 1) * perPage)
                .limit(perPage)
        })
        .then(productData => {
            res.render('user/allProducts', {
                route: 'Sort',
                productData,
                task: req.query.sortOrder,
                category: '',
                subCategories,
                uniqueBrandNames,
                currentPage: page,
                totalDocuments: docCount,
                pages: Math.ceil(docCount / perPage)
            })
        })
}


const filterProducts = async (req, res) => {
    try {
        let allProducts = await productModel.find({})
        let brandNames = allProducts.map((val) => val.BrandName)
        let uniqueBrandNames = [...new Set(brandNames)];
        const subCategories = await subCategorySchema.find({})

        if (req.query.subCategory) {
            let subCategory = req.query.subCategory
            let category = req.query.category
            const page = req.query.page;
            const perPage = 4;
            let docCount;
            const productData = await productModel.find({ CategoryName: category, subCategory: subCategory })
                .countDocuments()
                .then(documents => {
                    docCount = documents;
                    return productModel.find({ CategoryName: category, subCategory: subCategory })
                        .skip((page - 1) * perPage)
                        .limit(perPage)
                })
                .then(productData => {
                    res.render('user/allProducts', {
                        route: 'allProducts',
                        productData,
                        category: '',
                        subCategories,
                        uniqueBrandNames,
                        currentPage: page,
                        totalDocuments: docCount,
                        pages: Math.ceil(docCount / perPage)
                    })
                })
        }

    } catch (error) {
        console.log(error)
    }

}


const removeCartProduct = async (req, res) => {
    const token = req.cookies.jwtUser; // Assuming token is stored in cookies
    const userID = getUserId(token); // Verify token and get userID
    try {
        if (req.query.task === 'deleteCartItem') {
            await addtToCartModel.findOneAndDelete({ _id: req.query.id, userID: userID });
            res.redirect('/shoppingcart');
        }
    } catch (error) {
        console.log(error);

        res.status(500).send('Internal Server Error');
    }
}
module.exports = {
    landingPage, productOverview, overviewFilter, priceFilter, allProductFilter, filterProducts,removeCartProduct
}