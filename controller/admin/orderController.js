const orderSchema = require('../../models/order.js')//order schema
require('dotenv').config()



//orderhistory related get request
const orderHistory = async (req, res) => {
    try {
        if (req.query.task === 'all') {
            const orderDetails = await orderSchema.find({})
                .populate('productID')
                .populate('userID')
                .populate('addressID')
            res.render('admin/orderHistory', { orderDetails })
        } else if (req.query.task === 'OrderPlaced') {
            const orderDetails = await orderSchema.find({ Status: 'Order Placed' })
                .populate('productID')
                .populate('userID')
                .populate('addressID')
            res.render('admin/orderHistory', { orderDetails })
        } else if (req.query.task === 'Delivered') {
            const orderDetails = await orderSchema.find({ Status: 'Delivered' })
                .populate('productID')
                .populate('userID')
                .populate('addressID')
            res.render('admin/orderHistory', { orderDetails })
        } else if (req.query.task === 'Cancelled') {
            const orderDetails = await orderSchema.find({ Status: 'Cancelled' })
                .populate('productID')
                .populate('userID')
                .populate('addressID')
            res.render('admin/orderHistory', { orderDetails })
        } else if (req.query.task === 'customDate') {
            const startDate = req.query.startDate
            const endDate = req.query.endDate
            const orderDetails = await orderSchema.find({
                OrderDate: {
                    $gte: new Date(startDate), // Start of the specified date range
                    $lte: new Date(endDate) // End of the specified date range
                }
            }).sort({ OrderDate: 1 })
                .populate('productID')
                .populate('userID')
                .populate('addressID')
            res.render('admin/orderHistory', { orderDetails })
        } else {
            const orderDetails = await orderSchema.find({})
                .populate('productID')
                .populate('userID')
                .populate('addressID')
            res.render('admin/orderHistory', { orderDetails })
        }
    } catch (error) {
        console.log(error)
    }
}

const orderTasks = async (req, res) => {
    try {
        if (req.query.task === 'updateStatus') {
            const orderID = req.body.orderID
            const newStatus = req.body.orderStatus
            await orderSchema.findByIdAndUpdate(orderID, { Status: newStatus })
            res.json({ message: 'success' })
        }
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    orderTasks,orderHistory
}