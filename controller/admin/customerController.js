const userModel = require('../../models/register.js')//user schema
require('dotenv').config()


//CustomerDetails get Request
const customerDetails = async (req, res) => {
    try {
        const users = await userModel.find({}).select("-password")
        res.render('admin/CustomerDetails', { users })
    } catch (error) {
        console.log(error)
    }
}


//listed and ulisted for CustomerDetails page
const updateUser = async (req, res) => {
    try {
        const user = await userModel.findById(req.query.id)
        switch (user.status) {
            case true:
                await userModel.findByIdAndUpdate(req.query.id, { status: false });
                res.clearCookie('jwtUser'); // removing the cookies
                res.redirect('/adminLogin/CustomerDetails');
                break;
            case false:
                await userModel.findByIdAndUpdate(req.query.id, { status: true });
                res.redirect('/adminLogin/CustomerDetails');
                break;
            default:
                res.status(400).send('Invalid user status');
                break;
        }
    } catch (error) {
        console.log(error)
    }
   
}

//CustomerDetails get Request
const customerFilter = async (req, res) => {
    try {
        if (req.query.filter == "all") {
            const users = await userModel.find({}).select("-password")
            console.log(req.query.filter);
            res.render('admin/CustomerDetails', { users })
        }
        else if (req.query.filter == "active") {
            const users = await userModel.find({ status: true }).select("-password")
            console.log(req.query.filter);
            res.render('admin/CustomerDetails', { users })
        }
        else if (req.query.filter == "blocked") {
            try {
                const users = await userModel.find({ status: false }).select("-password")
                console.log(req.query.filter);
                res.render('admin/CustomerDetails', { users })
            } catch (error) {
                console.log(error)
            }

        }
    } catch (error) {
        console.log(error)
    }


}

module.exports = {
    customerDetails, updateUser,customerFilter
}