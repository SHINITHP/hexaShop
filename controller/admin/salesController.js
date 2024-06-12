const orderSchema = require('../../models/order.js')//order schema
require('dotenv').config()


const salesReport = async (req, res) => {
    if (req.query.filter === 'All') {
        const salesReport = await orderSchema.find({ Status: 'Delivered' })
            .populate('productID')
            .populate('addressID')
        res.render('admin/salesReport', { salesReport })
    } else if (req.query.filter === 'Daily') {
        // Get the current date
        const currentDate = new Date();

        // Extract the date part from currentDate
        const currentDateOnly = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

        const salesReport = await orderSchema.find({
            Status: 'Delivered', OrderDate: {
                $gte: currentDateOnly, // Greater than or equal to the current date
                $lt: new Date(currentDateOnly.getTime() + 86400000) // Less than the next day
            }
        }).sort({ OrderDate: 1 })
            .populate('productID')
            .populate('addressID')
        res.render('admin/salesReport', { salesReport })
    } else if (req.query.filter === 'Monthly') {
        const currentMonth = new Date().getMonth() + 1; // Adding 1 because months are zero-indexed
        const currentYear = new Date().getFullYear();

        const salesReport = await orderSchema.find({
            Status: 'Delivered',
            OrderDate: {
                $gte: new Date(currentYear, currentMonth - 1, 1), // Start of the current month
                $lt: new Date(currentYear, currentMonth, 0) // End of the current month
            }
        }).sort({ OrderDate: 1 })
            .populate('productID')
            .populate('addressID')
        res.render('admin/salesReport', { salesReport })
    } else if (req.query.filter === 'Yearly') {
        // Get the current year
        const currentYear = new Date().getFullYear();

        const salesReport = await orderSchema.find({
            Status: 'Delivered',
            OrderDate: {
                $gte: new Date(currentYear, 0, 1), // Start of the current year (January 1st)
                $lt: new Date(currentYear + 1, 0, 1) // Start of the next year (January 1st of the next year)
            }
        }).sort({ OrderDate: 1 })

            .populate('productID')
            .populate('addressID')
        res.render('admin/salesReport', { salesReport })
    } else if (req.query.filter === 'customDate') {
        const startDate = req.query.startDate
        const endDate = req.query.endDate

        const salesReport = await orderSchema.find({
            Status: 'Delivered',
            OrderDate: {
                $gte: new Date(startDate), // Start of the specified date range
                $lte: new Date(endDate) // End of the specified date range
            }
        }).sort({ OrderDate: 1 })
            .populate('productID')
            .populate('addressID')

        res.render('admin/salesReport', { salesReport })
    } else {
        const salesReport = await orderSchema.find({ Status: 'Delivered' })
            .populate('productID')
            .populate('addressID')
        res.render('admin/salesReport', { salesReport })
    }

}


module.exports = {
    salesReport
}