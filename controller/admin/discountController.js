const productModel = require('../../models/products.js')//product schema
const couponSchema = require('../../models/coupon.js')//coupon schema
const offerSchema = require('../../models/offer.js')//offer schema
const fs = require('fs')
const mongoose = require('mongoose');
require('dotenv').config()
const { generateSimpleUniqueId } = require('../../utils/functions.js')


const coupon = async (req, res) => {
    try {
        if (req.query.task === 'All') {
            const coupons = await couponSchema.find({})
            res.render('admin/Coupon', { coupons })
        } else if (req.query.task === 'Active') {
            const coupons = await couponSchema.find({ status: 'Listed' })
            res.render('admin/Coupon', { coupons })
        }
        else if (req.query.task === 'Expired') {
            console.log('Unlisted')
            const coupons = await couponSchema.find({ status: 'Unlisted' })
            res.render('admin/Coupon', { coupons })
        } else if (req.query.task === 'customDate') {
            const startDate = req.query.startDate
            const endDate = req.query.endDate

            const coupons = await couponSchema.find({
                startDate: {
                    $gte: new Date(startDate), // Start of the specified date range
                },
                Expire: {
                    $lte: new Date(endDate), // Start of the specified date range
                }

            }).sort({ OrderDate: 1 })

            res.render('admin/Coupon', { coupons })
        } else {
            const coupons = await couponSchema.find({})
            res.render('admin/Coupon', { coupons })
        }

    } catch (error) {
        console.log(error)
    }

}

const couponTasks = async (req, res) => {
    try {
        if (req.query.task == 'generateCode') {
            const uniqueId = generateSimpleUniqueId(); // Generate a new unique ID
            res.json({ message: uniqueId }); // Sending JSON object with the generated unique ID
        } else if (req.query.task == 'addCoupon') {

            try {
                const data = {
                    couponCode: req.body.code,
                    Expire: req.body.expireOn,
                    discountAmount: req.body.discountAmt,
                    startDate: req.body.start,
                    minimumPurchase: req.body.min,
                    maxAmount: req.body.max,
                    title: req.body.title
                }

                await couponSchema.create(data)

                res.json({ message: 'success' })
            } catch (error) {
                console.log(error)
            }

        } else if (req.query.task == 'changeStatus') {
            try {
                if (req.body.currStatus === 'Listed') {
                    await couponSchema.findByIdAndUpdate(req.body.id, { $set: { status: 'Unlisted' } })
                } else if (req.body.currStatus === 'Unlisted') {
                    await couponSchema.findByIdAndUpdate(req.body.id, { $set: { status: 'Listed' } })
                }
            } catch (error) {
                console.log(error)
            }
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' }); // Handle error response
    }
};

const deletCoupon = async (req, res) => {
    try {
        const id = req.body.id;
        await couponSchema.findByIdAndDelete(id)
        res.json({ message: 'sucess' })
    } catch (error) {
        console.log(error)
    }
}


//to show the offer page
const offers = async (req, res) => {
    try {
        if (req.query.filter === 'All') {
            const offers = await offerSchema.find({}).populate('productID');
            res.render('admin/offers', { offers })
        } else if (req.query.filter === 'Listed') {
            const offers = await offerSchema.find({ status: 'Listed' }).populate('productID');
            res.render('admin/offers', { offers })
        }
        else if (req.query.filter === 'Unlisted') {
            const offers = await offerSchema.find({ status: 'Unlisted' }).populate('productID');
            res.render('admin/offers', { offers })
        }
        else {
            const offers = await offerSchema.find({}).populate('productID');
            res.render('admin/offers', { offers })
        }
    } catch (error) {
        console.log(error)
    }
}


//create offers
const offerTasks = async (req, res) => {
    try {
        if (req.query.task === 'selectProduct') {
            const products = await productModel.find({ CategoryName: req.body.Category })
            res.json({ products })
        } else if (req.query.task === 'createOffer') {
            const title = req.body.title
            const percentage = req.body.percentage
            const Category = req.body.Category
            const selectedValues = req.body.selectedValues.map(id => new mongoose.Types.ObjectId(id));
            const data = {
                productID: selectedValues,
                categoryID: Category,
                title,
                percentage
            }
            await offerSchema.create(data)
            selectedValues.forEach(async (val) => {
                await productModel.findByIdAndUpdate(val, {
                    $set: {
                        offer: percentage
                    }
                })
            })
            res.json({ message: 'success' })
        }
    } catch (error) {
        console.log(error)
    }
}


//edit offers
const editOffer = async (req, res) => {
    try {

        if (req.query.task === 'changeStatus') {
            if (req.body.currStatus === 'Listed') {
                console.log(req.body.currStatus, req.body.id)
                const data = await offerSchema.findByIdAndUpdate(req.body.id, { $set: { status: 'Unlisted' } })
                let productIDs = data.productID;
                productIDs.forEach(async (val) => {
                    await productModel.findByIdAndUpdate(val, { $set: { offer: 0 } })
                })
                console.log(productIDs, ': productIDs')
                res.json({ message: 'success' })
            } else if (req.body.currStatus === 'Unlisted') {
                console.log(req.body.currStatus, req.body.id)
                const data = await offerSchema.findByIdAndUpdate(req.body.id, { $set: { status: 'Listed' } })
                let productIDs = data.productID;
                productIDs.forEach(async (val) => {
                    await productModel.findByIdAndUpdate(val, { $set: { offer: data.percentage } })
                })
                res.json({ message: 'success' })
            }
        }
    } catch (error) {
        console.log(error)
    }
}

//delete controller for offer page
const deleteOffer = async (req, res) => {
    try {
        const productID = req.body.productID.split(',');
        const { id } = req.body
        productID.forEach(async (val) => {
            await productModel.findByIdAndUpdate(val, { $set: { offer: 0 } })
        })
        await offerSchema.findByIdAndDelete(id)
        res.json({ message: 'success' })
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    coupon, couponTasks, deletCoupon,offers,offerTasks,editOffer,deleteOffer
}