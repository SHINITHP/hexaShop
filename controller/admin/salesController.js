const orderSchema = require('../../models/order.js')//order schema
require('dotenv').config()


const salesReport = async (req, res) => {
    try {
        let salesReport;

        switch (req.query.filter) {
            case 'All':
                salesReport = await orderSchema.find({ Status: 'Delivered' })
                    .populate('productID')
                    .populate('addressID');
                break;
            case 'Daily':
                const currentDate = new Date();
                const currentDateOnly = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
                salesReport = await orderSchema.find({
                    Status: 'Delivered',
                    OrderDate: {
                        $gte: currentDateOnly,
                        $lt: new Date(currentDateOnly.getTime() + 86400000)
                    }
                }).sort({ OrderDate: 1 })
                    .populate('productID')
                    .populate('addressID');
                break;
            case 'Monthly':
                const currentMonth = new Date().getMonth() + 1;
                const currentYear = new Date().getFullYear();
                salesReport = await orderSchema.find({
                    Status: 'Delivered',
                    OrderDate: {
                        $gte: new Date(currentYear, currentMonth - 1, 1),
                        $lt: new Date(currentYear, currentMonth, 0)
                    }
                }).sort({ OrderDate: 1 })
                    .populate('productID')
                    .populate('addressID');
                break;
            case 'Yearly':
                const currentYearOnly = new Date().getFullYear();
                salesReport = await orderSchema.find({
                    Status: 'Delivered',
                    OrderDate: {
                        $gte: new Date(currentYearOnly, 0, 1),
                        $lt: new Date(currentYearOnly + 1, 0, 1)
                    }
                }).sort({ OrderDate: 1 })
                    .populate('productID')
                    .populate('addressID');
                break;
            case 'customDate':
                const startDate = req.query.startDate;
                const endDate = req.query.endDate;
                salesReport = await orderSchema.find({
                    Status: 'Delivered',
                    OrderDate: {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate)
                    }
                }).sort({ OrderDate: 1 })
                    .populate('productID')
                    .populate('addressID');
                break;
            default:
                salesReport = await orderSchema.find({ Status: 'Delivered' })
                    .populate('productID')
                    .populate('addressID');
                break;
        }

        res.render('admin/salesReport', { salesReport });
    } catch (error) {
        console.log(error)
    }
}



module.exports = {
    salesReport
}