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

let couponApplied = false, otp;


const checkOut = async (req, res) => {
    try {
        const token = req.cookies.jwtUser; // Assuming token is stored in cookies
        const userID = getUserId(token) // Verify token and get userID
        if (req.query.task === 'checkValidOrder') {
            let cartDetails = req.body.cartDetails;
            res.json({ message: 's' })
        } else {
            couponApplied = false
            try {
                if (req.query.task == 'checkWallet') {
                    const checkWallet = await walletSchema.findOne({ userID: userID }).sort({ added: -1 });
                    res.json(checkWallet)
                } else {
                    const cartDetails = await orderSummary.find({ userID: userID }).populate('productID')
                    const userInfo = await addressModel.find({ userID: userID, selected: true })
                    const addresses = await addressModel.find({ userID: userID })
                    res.render('user/checkOut', { cartDetails, userInfo, addresses })
                }

            } catch (error) {
                console.error("Error fetching cart products:", error);
            }
        }
    } catch (error) {
        console.log(error)
    }

}


const checkOutTasks = async (req, res) => {
    try {
        const token = req.cookies.jwtUser; // Assuming token is stored in cookies
        const userID = getUserId(token); // Verify token and get userID
        if (req.query.task === 'removeProducts') {
            try {
                const orderSummaryId = req.body.id;
                await orderSummary.deleteMany({ _id: orderSummaryId })
                res.redirect('/checkOut');
            } catch (error) {
                console.log(error)
            }

        } else if (req.query.task === 'AddToWallet') {
            const token = req.cookies.jwtUser;
            const userID = getUserId(token);
            const AddAmount = req.body.AddAmount;
            const latestWishlistItem = await walletSchema.findOne({ userID: userID }).sort({ added: -1 });
            if (latestWishlistItem) {
                const updatedDocument = await walletSchema.findOneAndUpdate(
                    { userID: userID },
                    { $inc: { balance: AddAmount } },
                    { sort: { _id: -1 }, new: true }
                );
                res.json({ message: 'successfully added' })
            } else {
                let options = {
                    userID: userID,
                    balance: AddAmount,
                    transaction: 'Credit'
                }
                await walletSchema.create(options)
                res.json({ message: 'successfully created' })
            }
        } else if (req.query.task === 'walletPayment') {
            const paymentMethod = req.body.paymentMethod;
            const ProductData = JSON.parse(req.body.ProductData);
            const addressID = req.body.addressID;
            try {
                let details;
                const orderDetails = ProductData.map((val) => {
                    return details = {
                        userID: val.userID,
                        productID: val.productID._id,
                        addressID: addressID,
                        Quantity: val.quantity,
                        Amount: req.body.total,
                        Size: val.size,
                        PaymentMethod: paymentMethod,
                        deliveryCharge: req.body.deliveryCharge
                    }
                })
                ProductData.forEach(async element => {
                    await addtToCartModel.findByIdAndDelete(element.productID._id)
                })
                const orderData = await orderSchema.create(orderDetails);
                const order = await Promise.all(ProductData.map(async (val, i) => {
                    const checkWallet = await walletSchema.findOne({ userID: val.userID }).sort({ added: -1 });
                    const balance = checkWallet ? checkWallet.balance - req.body.total : orderData[i].Amount;
                    return {
                        userID: val.userID,
                        productID: val.productID._id,
                        orderID: orderData[i]._id,
                        balance: balance,
                        transaction: 'Debit'
                    };
                }));
                let returnData;
                const UpdatedData = ProductData.map((val, index) => {
                    return returnData = {
                        ProductName: val.productID.ProductName,
                        BrandName: val.productID.BrandName,
                        CategoryName: val.productID.CategoryName,
                        StockQuantity: val.productID.StockQuantity - val.quantity,
                        subCategory: val.productID.subCategory,
                        PurchaseRate: val.productID.PurchaseRate,
                        SalesRate: val.productID.SalesRate,
                        ColorNames: val.productID.ColorNames,
                        ProductDescription: val.productID.ProductDescription,
                        VATAmount: val.productID.VATAmount,
                        MRP: val.productID.MRP,
                        ProductSize: [
                            {
                                size: val.productID.ProductSize[0].size,
                                quantity: orderDetails[index].Size === val.productID.ProductSize[0].size ? val.productID.ProductSize[0].quantity - orderDetails[index].Quantity : val.productID.ProductSize[0].quantity
                            },
                            {
                                size: val.productID.ProductSize[1].size,
                                quantity: orderDetails[index].Size === val.productID.ProductSize[1].size ? val.productID.ProductSize[1].quantity - orderDetails[index].Quantity : val.productID.ProductSize[1].quantity
                            },
                            {
                                size: val.productID.ProductSize[2].size,
                                quantity: orderDetails[index].Size === val.productID.ProductSize[2].size ? val.productID.ProductSize[2].quantity - orderDetails[index].Quantity : val.productID.ProductSize[2].quantity
                            },
                            {
                                size: val.productID.ProductSize[3].size,
                                quantity: orderDetails[index].Size === val.productID.ProductSize[3].size ? val.productID.ProductSize[3].quantity - orderDetails[index].Quantity : val.productID.ProductSize[3].quantity
                            },
                            {
                                size: val.productID.ProductSize[4].size,
                                quantity: orderDetails[index].Size === val.productID.ProductSize[4].size ? val.productID.ProductSize[4].quantity - orderDetails[index].Quantity : val.productID.ProductSize[4].quantity
                            }

                        ],
                        files: val.productID.files,
                        Inventory: val.productID.Inventory,
                        Added: val.productID.Added,
                        SI: val.productID.SI
                    }
                })
                const id = orderDetails[0].productID;
                await productModel.findByIdAndUpdate(id, UpdatedData[0], { new: true });
                for (const element of ProductData) {
                    const orderDetails = await orderSummary.deleteMany({ productID: element.productID._id });
                    const addToCart = await addtToCartModel.deleteMany({ productID: element.productID._id });

                }
                await walletSchema.create(order)
            } catch (error) {
                console.log(error)
            }
        } else if (req.query.task === 'failedPayment') {
            const orderID = req.body.orderID;
            console.log('orderID :', orderID)
            try {
                await orderSchema.findByIdAndUpdate(orderID, { $set: { Status: 'Order Placed' } }, { new: true });
                res.json({ message: 'success' })
            } catch (error) {
                console.log(error)
            }
        }
        else if (req.query.task === 'RazorPay') {
            const paymentMethod = req.body.paymentMethod;
            const ProductData = JSON.parse(req.body.ProductData);
            const addressID = req.body.addressID;
            const couponDiscount = req.body.couponDiscount
            const productCount = couponDiscount / ProductData.length;
            const couponData = {
                userID: userID,
                couponCode: req.body.AppliedCode
            }
            await appliedCoupon.create(couponData)
            try {
                let details;
                const orderDetails = ProductData.map((val) => {
                    const discountAmt = parseFloat(val.productID.SalesRate * productCount / 100)
                    return details = {
                        userID: val.userID,
                        productID: val.productID._id,
                        addressID: addressID,
                        Quantity: val.quantity,
                        Amount: val.productID.SalesRate - discountAmt,
                        Size: val.size,
                        PaymentMethod: paymentMethod,
                        couponDiscount: productCount
                    }
                })

                let returnData;
                const UpdatedData = ProductData.map((val, index) => {
                    return returnData = {
                        ProductName: val.productID.ProductName,
                        BrandName: val.productID.BrandName,
                        CategoryName: val.productID.CategoryName,
                        StockQuantity: val.productID.StockQuantity - val.quantity,
                        subCategory: val.productID.subCategory,
                        PurchaseRate: val.productID.PurchaseRate,
                        SalesRate: val.productID.SalesRate,
                        ColorNames: val.productID.ColorNames,
                        ProductDescription: val.productID.ProductDescription,
                        VATAmount: val.productID.VATAmount,
                        MRP: val.productID.MRP,
                        ProductSize: [
                            {
                                size: val.productID.ProductSize[0].size,
                                quantity: orderDetails[index].Size === val.productID.ProductSize[0].size ? val.productID.ProductSize[0].quantity - orderDetails[index].Quantity : val.productID.ProductSize[0].quantity
                            },
                            {
                                size: val.productID.ProductSize[1].size,
                                quantity: orderDetails[index].Size === val.productID.ProductSize[1].size ? val.productID.ProductSize[1].quantity - orderDetails[index].Quantity : val.productID.ProductSize[1].quantity
                            },
                            {
                                size: val.productID.ProductSize[2].size,
                                quantity: orderDetails[index].Size === val.productID.ProductSize[2].size ? val.productID.ProductSize[2].quantity - orderDetails[index].Quantity : val.productID.ProductSize[2].quantity
                            },
                            {
                                size: val.productID.ProductSize[3].size,
                                quantity: orderDetails[index].Size === val.productID.ProductSize[3].size ? val.productID.ProductSize[3].quantity - orderDetails[index].Quantity : val.productID.ProductSize[3].quantity
                            },
                            {
                                size: val.productID.ProductSize[4].size,
                                quantity: orderDetails[index].Size === val.productID.ProductSize[4].size ? val.productID.ProductSize[4].quantity - orderDetails[index].Quantity : val.productID.ProductSize[4].quantity
                            }

                        ],
                        files: val.productID.files,
                        Inventory: val.productID.Inventory,
                        Added: val.productID.Added,
                        SI: val.productID.SI
                    }
                })
                const id = orderDetails[0].productID;
                await productModel.findByIdAndUpdate(id, UpdatedData[0], { new: true });

                for (const element of ProductData) {
                    const orderDetails = await orderSummary.deleteMany({ productID: element.productID._id });
                    const addToCart = await addtToCartModel.deleteMany({ productID: element.productID._id });

                }
                const orderData = await orderSchema.create(orderDetails)
            } catch (error) {
                console.log(error)
            }

        } else if (req.query.task === 'RazorPay-Failed') {
            const paymentMethod = req.body.paymentMethod;
            const ProductData = JSON.parse(req.body.ProductData);
            const addressID = req.body.addressID;
            const couponDiscount = req.body.couponDiscount
            const productCount = couponDiscount / ProductData.length;
            const couponData = {
                userID: userID,
                couponCode: req.body.AppliedCode
            }
            await appliedCoupon.create(couponData)
            try {
                let details;
                const orderDetails = ProductData.map((val) => {
                    const discountAmt = parseFloat(val.productID.SalesRate * productCount / 100)
                    return details = {
                        userID: val.userID,
                        productID: val.productID._id,
                        addressID: addressID,
                        Quantity: val.quantity,
                        Amount: req.body.amount,
                        Size: val.size,
                        PaymentMethod: paymentMethod,
                        couponDiscount: productCount,
                        Status: 'Failed'
                    }
                })
                const id = orderDetails[0].productID;
                for (const element of ProductData) {
                    await orderSummary.deleteMany({ productID: element.productID._id });
                    await addtToCartModel.deleteMany({ productID: element.productID._id });
                }
                await orderSchema.create(orderDetails)

                res.json({ message: 'success' })
            } catch (error) {
                console.log(error)
            }
        }
        else if (req.query.task === 'saveOrderDetails') {

            const paymentMethod = req.body.paymentMethod;
            const ProductData = JSON.parse(req.body.ProductData);
            const addressID = req.body.addressID;
            const couponDiscount = req.body.couponDiscount
            const partialCount = couponDiscount / ProductData.length;
            try {
                let details;
                const orderDetails = ProductData.map((val) => {
                    const discountAmt = parseFloat(val.productID.SalesRate * partialCount / 100)
                    return details = {
                        userID: val.userID,
                        productID: val.productID._id,
                        addressID: addressID,
                        Quantity: val.quantity,
                        Amount: req.body.amount,
                        Size: val.size,
                        PaymentMethod: paymentMethod,
                        couponDiscount: partialCount,
                        deliveryCharge: req.body.deliveryCharge
                    }
                })

                let returnData;
                const UpdatedData = ProductData.map((val, index) => {
                    return returnData = {
                        ProductName: val.productID.ProductName,
                        BrandName: val.productID.BrandName,
                        CategoryName: val.productID.CategoryName,
                        StockQuantity: val.productID.StockQuantity - val.quantity,
                        subCategory: val.productID.subCategory,
                        PurchaseRate: val.productID.PurchaseRate,
                        SalesRate: val.productID.SalesRate,
                        ColorNames: val.productID.ColorNames,
                        ProductDescription: val.productID.ProductDescription,
                        VATAmount: val.productID.VATAmount,
                        MRP: val.productID.MRP,
                        ProductSize: [
                            {
                                size: val.productID.ProductSize[0].size,
                                quantity: orderDetails[index].Size === val.productID.ProductSize[0].size ? val.productID.ProductSize[0].quantity - orderDetails[index].Quantity : val.productID.ProductSize[0].quantity
                            },
                            {
                                size: val.productID.ProductSize[1].size,
                                quantity: orderDetails[index].Size === val.productID.ProductSize[1].size ? val.productID.ProductSize[1].quantity - orderDetails[index].Quantity : val.productID.ProductSize[1].quantity
                            },
                            {
                                size: val.productID.ProductSize[2].size,
                                quantity: orderDetails[index].Size === val.productID.ProductSize[2].size ? val.productID.ProductSize[2].quantity - orderDetails[index].Quantity : val.productID.ProductSize[2].quantity
                            },
                            {
                                size: val.productID.ProductSize[3].size,
                                quantity: orderDetails[index].Size === val.productID.ProductSize[3].size ? val.productID.ProductSize[3].quantity - orderDetails[index].Quantity : val.productID.ProductSize[3].quantity
                            },
                            {
                                size: val.productID.ProductSize[4].size,
                                quantity: orderDetails[index].Size === val.productID.ProductSize[4].size ? val.productID.ProductSize[4].quantity - orderDetails[index].Quantity : val.productID.ProductSize[4].quantity
                            }

                        ],
                        files: val.productID.files,
                        Inventory: val.productID.Inventory,
                        Added: val.productID.Added,
                        SI: val.productID.SI
                    }
                })
                const id = orderDetails[0].productID;
                await productModel.findByIdAndUpdate(id, UpdatedData[0], { new: true });
                for (const element of ProductData) {
                    const orderDetails = await orderSummary.deleteMany({ productID: element.productID._id });
                    const addToCart = await addtToCartModel.deleteMany({ productID: element.productID._id });
                }
                const orderData = await orderSchema.create(orderDetails)
            } catch (error) {
                console.log(error)
            }

        }
        else if (req.query.task === 'addAddress') {
            try {
                const {
                    addressType, address, pincode,
                    state, gender, emailAddress,
                    country, cityDistrictTown, phoneNo,
                    fullName
                } = req.body

                const UserAddress = {
                    addressType, address, pincode,
                    state, gender, emailAddress,
                    country, cityDistrictTown, phoneNo,
                    fullName, userID
                }

                await addressModel.create(UserAddress);
                res.redirect('/checkOut')
            } catch (error) {
                console.log(error)
            }
        } else if (req.query.task === 'checkCoupon') {
            try {
                const currentDate = new Date(); // Get today's date
                const couponExist = await couponModel.findOne({
                    couponCode: req.body.couponCode,
                    Expire: { $gte: currentDate },
                    status: 'Listed'
                });
                const cartData = await addtToCartModel.find({ userID: userID })
                const couponUsed = await appliedCoupon.findOne({ userID: userID, couponCode: req.body.couponCode })
                if (couponApplied === false) {
                    if (couponExist) {
                        if (!couponUsed) {
                            couponApplied = true;
                            res.json({ message: couponExist.discountAmount })
                        } else {
                            res.json({ error: 'Coupon Is Already Applied', message: couponExist.discountAmount })
                        }

                    } else {
                        res.json({ error: 'Coupon Is Already Expired' })
                    }

                } else {
                    res.json({ error: 'Coupon Is Already Applied', message: couponExist.discountAmount })
                }

            } catch (error) {
                console.log(error)
            }
        } else {
            res.render('user/404Error')
        }
    } catch (error) {
        console.log(error)
    }


}

const updateCheckout = async (req, res) => {
    try {
        if (req.query.task === 'selectDeleveryAddress') {
            try {
                const addressID = req.body.addressID
                await addressModel.updateMany({}, { $set: { selected: false } })
                await addressModel.findOneAndUpdate({ _id: addressID }, { $set: { selected: true } })
            } catch (error) {
                console.log('Error on select Delivery Address')
            }
        }
        else if (req.query.task === 'updateAddress') {
            try {
                const id = req.query.id;
                const data = {
                    fullName: req.body.fullName,
                    emailAddress: req.body.emailAddress,
                    phoneNo: req.body.mobileNo,
                    cityDistrictTown: req.body.cityDistrictTown,
                    state: req.body.state,
                    country: req.body.country,
                    pincode: req.body.pinCode,
                    gender: req.body.gender,
                    address: req.body.address,
                    addressType: req.body.addressType
                }
                await addressModel.findByIdAndUpdate(id, data, { new: true });
                res.redirect('/checkOut')
            } catch (error) {
                console.log('Error on select Delivery Address')
            }
        } else if (req.query.task === 'incQuantity') {
            const token = req.cookies.jwtUser; // Assuming token is stored in cookies
            const userID = getUserId(token);
            console.log(req.body.id)
            const data = await orderSummary.findById(req.body.id).populate('productID')
            console.log(data, ": summarydata")
            let productSize = data.productID.ProductSize;
            let b;
            let filter = productSize.filter((val, i) => {
                if (val.size === data.size) {
                    b = val.quantity;
                }
                return b;
            })
            if (req.body.type === 'increment') {
                if (data.quantity + 1 <= b) {
                    const updateddata = await orderSummary.findByIdAndUpdate(req.body.id,
                        {
                            $set:
                                { quantity: req.body.newQty, totalMRP: data.productID.MRP * req.body.newQty }
                        })
                    res.json(updateddata)
                } else {
                    let limit = 'finished'
                    res.json(limit)
                }
            } else if (req.body.type === 'decrement') {
                // console.log('data[0].productID.SalesRate * req.body.newQty', data.productID.SalesRate * req.body.newQty);
                const updateddata = await orderSummary.findByIdAndUpdate(req.body.id, { $set: { quantity: req.body.newQty, totalMRP: data.productID.MRP * req.body.newQty } })
                res.json(updateddata)
            }
    
        }
    } catch (error) {
        console.log(error)
    }
    
}



module.exports = {
    checkOut, checkOutTasks, updateCheckout
}