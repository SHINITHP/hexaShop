const userModel = require('../../models/register.js')
const addressModel = require('../../models/address.js')
const addtToCartModel = require('../../models/cart.js')
const appliedCoupon = require('../../models/AppliedCoupon.js')
const subCategorySchema = require('../../models/category.js')
const couponModel = require('../../models/coupon.js')
const orderSummary = require('../../models/orderSummary.js')
const orderSchema = require('../../models/order.js')
const otpModel = require('../../models/otp.js')
const walletSchema = require('../../models/wallet.js')
const wishlistSchema = require('../../models/wishlist.js')
const productModel = require('../../models/products.js')
const bcrypt = require('bcrypt')
const otpGenerator = require('otp-generator');
const jwt = require('jsonwebtoken');
require('dotenv').config()
const Razorpay = require('razorpay')
const crypto = require('crypto');
const { getUserId, randomToken, generateSimpleUniqueId, generateUniqueFourDigitNumber } = require('../../utils/functions.js')
const uniqueId = generateSimpleUniqueId();
const pdf = require('html-pdf');
let globalUser = {
  userName: "",
  phoneNo: "",    
  emailAddress: "",
  password: ""
};

let couponApplied = false, otp;

//Section for GET Request start here.......
const generatePDF = async (req, res) => {
  try {
    const invoiceNum = generateUniqueFourDigitNumber()
    const date = new Date();
    const formattedDate = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
    const invoiceData = JSON.parse(req.query.data);
    res.render('user/invoice', { invoiceData, formattedDate, invoiceNum }, (err, html) => {
      if (err) {
        return res.status(500).send('Error generating HTML');
      }
      pdf.create(html).toStream((err, stream) => {
        if (err) {
          return res.status(500).send('Error creating PDF');
        }
        res.setHeader('Content-type', 'application/pdf');
        stream.pipe(res);
      });
    });

  } catch (err) {
    console.error('Error fetching orders or generating invoice:', err);
    res.status(500).send('Error fetching orders or generating invoice');
  }
};
//..................................................................................................................................................

//get method for shoppingcart
const shoppingCart = async (req, res) => {
  const token = req.cookies.jwtUser; // Assuming token is stored in cookies
  const userID = getUserId(token); // Verify token and get userID
  try {
    const cartItems = await addtToCartModel.find({ userID: userID }).populate('productID');
    res.render('user/shoppingCart', { cartItems })
  } catch (error) {
    console.error("Error fetching cart products:", error);
  }
}
//..................................................................................................................................................

//logout get Request
const logout = async (req, res) => {
  const token = req.cookies.jwtUser; // Assuming token is stored in cookies
  const userID = getUserId(token);
  res.clearCookie('jwtUser');
  await userModel.findByIdAndUpdate(userID, { $set: { logged: false } })  // Clear the cookie
  res.redirect('/')
}
//..................................................................................................................................................

//..................................................................................................................................................

//profile
const profile = async (req, res) => {
  const token = req.cookies.jwtUser; // Assuming token is stored in cookies
  const userID = await getUserId(token); // Verify token and get userID 
  try {
    const userInfo = await addressModel.find({ userID: userID }).populate('userID')
    const data = await userModel.findById(userID).select('-password');
    const userData = data ? [data] : [];
    res.render('user/Profile', { error: '', userInfo, userData })
  } catch (error) {
    console.error('Token verification failed:', error);
  }
}
//..................................................................................................................................................

const profileMenu = async (req, res) => {
  try {
    if (req.path == '/profileMenu') {
      const token = req.cookies.jwtUser; // Assuming token is stored in cookies
      const userID = getUserId(token); // Verify token and get userID 
      const userAddress = await addressModel.find({ userID: userID })
      if (req.query.menu == 'manageAddress') {
        res.render('user/manageAddress', { userAddress })
      }
      else if (req.query.menu == 'myOrders') {
        const orderDetails = await orderSchema.find({ userID: userID })
          .populate('productID')
          .populate('addressID')
          .sort({ _id: -1 }); // Sorting by _id in descending order 
        res.render('user/myOrders', { orderDetails });
      }
      else if (req.query.menu === 'wishlist') {
        const page = req.query.page;
        const perPage = 4;
        let docCount;
        const wishlist = await wishlistSchema.find({ userID: userID })
          .populate('productID')
          .countDocuments()
          .then(documents => {
            docCount = documents;
            return wishlistSchema.find({ userID: userID })
              .populate('productID')
              .skip((page - 1) * perPage)
              .limit(perPage)
          })
          .then(wishlist => {
            if (wishlist.length > 0) {
              res.render('user/wishlist', {
                route: 'wishlist',
                wishlist,
                currentPage: page,
                totalDocuments: docCount,
                pages: Math.ceil(docCount / perPage),
              })
            } else {
              res.render('user/wishlist', {
                route: 'wishlist',
                wishlist,
                currentPage: page,
                totalDocuments: docCount,
                pages: Math.ceil(docCount / perPage),
              })
            }
          })
        // res.render('user/wishlist', { wishlist })
      }
      else if (req.query.menu == 'Wallet') {
        const page = req.query.page;
        const perPage = 4;
        let docCount;
        const lastdetails = await walletSchema.findOne({ userID: userID }).sort({ added: -1 });
        const walletDetails = await walletSchema.find({ userID: userID })
          .populate('userID')
          .populate('productID')
          .populate('orderID')
          .countDocuments()
          .then(documents => {
            docCount = documents;
            return walletSchema.find({ userID: userID })
              .populate('userID')
              .populate('productID')
              .populate('orderID')
              .skip((page - 1) * perPage)
              .limit(perPage)
          })
          .then(walletDetails => {
            walletDetails = Array.isArray(walletDetails) ? walletDetails : [walletDetails];
            if (walletDetails.length > 0) {
              res.render('user/wallet', {
                route: 'wallet',
                walletDetails,
                currentPage: page,
                totalDocuments: docCount,
                pages: Math.ceil(docCount / perPage),
                balance: lastdetails.balance,
                userID
              })
            } else {
              res.render('user/wallet', {
                route: 'wallet',
                walletDetails,
                currentPage: page,
                totalDocuments: docCount,
                pages: Math.ceil(docCount / perPage),
                balance: '',
                userID
              })
            }
          })
      } else if (req.query.menu === 'coupon') {
        res.render('user/coupon')
      } else if (req.query.menu === 'trackOrder') {
        try {
          const token = req.cookies.jwtUser; // Assuming token is stored in cookies
          const userID = getUserId(token);
          const id = req.query.id;
          const data = await orderSchema.findById(id)
            .populate('addressID')
            .populate('productID')
          const trackDetails = data ? [data] : [];
          res.render('user/trackOrder', { trackDetails })
        } catch (error) {
          console.log(error)
        }

      }
    }
  } catch (error) {
    console.log(error)
  }
}
//..................................................................................................................................................

const deleteData = async (req, res) => {
  const { productID } = req.query;
  if (req.query.menu == 'removeWishlist') {
    try {
      console.log('profileMenu112332', productID)
      await wishlistSchema.findByIdAndDelete(productID)
      res.redirect('profileMenu?menu=wishlist')
    } catch (error) {
      console.log(error)
    }
  }
}
//..................................................................................................................................................

const saveImage = async (req, res) => {
  const token = req.cookies.jwtUser; // Assuming token is stored in cookies
  const userID = getUserId(token); // Verify token and get userID
}
const saveUserAddress = async (req, res) => {
  const token = req.cookies.jwtUser; // Assuming token is stored in cookies
  const userID = getUserId(token); // Verify token and get userID
  if (req.query.type === 'addAddress') {
    try {
      const {
        addressType, address, pincode,
        state, gender, emailAddress,
        country, cityDistrictTown, phoneNo,
        fullName
      } = req.body
      const userAddress = {
        addressType, address, pincode,
        state, gender, emailAddress,
        country, cityDistrictTown, phoneNo,
        fullName, userID
      }
      await addressModel.create(userAddress);
      res.redirect('/profileMenu?menu=manageAddress')
    } catch (error) {
      console.log(error)
    }

  } else if (req.query.task === 'addToCart') {
    try {
      const productID = req.body.productID
      const data = await productModel.findById(productID);
      const cartExist = await addtToCartModel.find({ productID: productID })
      if (cartExist.length > 0) {
        res.json({ message: 'Already Exist' })
      } else {
        const details = {
          userID,
          productID,
          quantity: 1,
          totalPrice: data.SalesRate,
          size: data.ProductSize[0].size,
          totalMRP: data.MRP
        }
        await addtToCartModel.create(details)
        res.json({ message: 'success' })
      }
    } catch (error) {
      console.log(error)
    }
  }
  else if (req.query.type === 'manageAddress') {
    try {
      const addressID = req.body.addressID
      const selected = req.body.selected
      await addressModel.updateMany({}, { $set: { selected: false } })
      await addressModel.findOneAndUpdate({ _id: addressID }, { $set: { selected: selected } })
      res.redirect('/profileMenu?menu=manageAddress')
    } catch (error) {
      console.log(error)
    }
  }
  else if (req.query.type === 'deleteAddress') {
    try {
      const id = req.body.id
      await addressModel.findByIdAndDelete(id)
      res.redirect('/profileMenu?menu=manageAddress')
    } catch (error) {
      console.log(error)
    }
  }
  else if (req.query.type === 'updateAddress') {
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
      res.redirect('/profileMenu?menu=manageAddress')
    } catch (error) {
      console.log(error)
    }
  }
  else if (req.query.type === 'cancelRequest') {

    const orderID = req.query.id
    const reqReason = req.body.reqReason
    const optionalReason = req.body.data
    const value = await orderSchema.findByIdAndUpdate(
      orderID,
      { $set: { requestReason: reqReason, request: true, comment: optionalReason, reqDate: Date.now() } }
    );

  } else if (req.query.type === 'returnOrder') {
    let optionalComment = req.query.optionalreason === '' ? 'empty' : req.body.optionalreason
    try {
      await orderSchema.findByIdAndUpdate(req.query.id,
        {
          $set: { return: true, requestReason: req.body.reason, comment: optionalComment }
        })
    } catch (error) { 
      console.log(error)
    }
  }
}
//..................................................................................................................................................

//..................................................................................................................................................

const orderDetails = async (req, res) => {
  const token = req.cookies.jwtUser; // Assuming token is stored in cookies
  const userID = getUserId(token); // Verify token and get userID

  try {
    const cartItems = JSON.parse(req.body.cartData);

    let allItemsValid = true; // To track if all items are valid
    let bulkOrderDetails = []; // To collect all order details to create at once

    for (const cartval of cartItems) {
      let id = cartval.productID._id;
      let productData = await productModel.findById(id).lean();
      let productSize = productData.ProductSize;

      let isValid = false;
      for (const val of productSize) {
        if (val.size === cartval.size) {
          if (val.quantity < cartval.quantity) {
            isValid = false;
            allItemsValid = false; // Set the flag to false if any item is invalid
            break; // No need to check other sizes for this product
          } else {
            isValid = true;
            bulkOrderDetails.push({
              userID: userID,
              productID: cartval.productID._id,
              quantity: cartval.quantity,
              size: cartval.size,
              totalPrice: req.body.total,
              totalMRP: cartval.productID.MRP,
              discount: req.body.discountAmt,
            });
            break; // Size matched and quantity is available
          }
        }
      }

      if (!isValid) {
        break; // Stop processing if any item is invalid
      }
    }

    if (allItemsValid) {
      await orderSummary.deleteMany({ userID: userID });
      await orderSummary.create(bulkOrderDetails);
      res.json({ message: 'success' });
    } else {
      res.json({ message: 'error' });
    }

  } catch (error) {
    console.error('Error processing cart items:', error);
    res.status(500).send('Error processing cart items');
  }
};
//..................................................................................................................................................

//..................................................................................................................................................

const updateProfile = async (req, res) => {
  const token = req.cookies.jwtUser; // Assuming token is stored in cookies
  const userID = getUserId(token); // Verify token and get userID
  const oldEmail = await userModel.findById(userID, { _id: 0, emailAddress: 1 });
  const emailAddress = oldEmail.emailAddress;
  if (req.query.task === 'checkEmailotp') {
    try {
      const newOTP = req.body.NewOTP
      const newEmail = req.body.newEmail;
      const response = await otpModel.find({ emailAddress }).sort({ createdAt: -1 }).limit(1);
      if (newOTP === response[0].otp) {
        await userModel.findByIdAndUpdate(userID, { $set: { emailAddress: newEmail } })
        res.json({ message: 'success' })
      } else {
        res.json({ message: 'error' })
      }
    } catch (error) {
      console.log(error)
    }
  }
  else if (req.query.task === 'changePassword') {
    try {
      const oldPassword = req.body.oldPassword;
      const newPassword = req.body.newPassword;
      const Password = await userModel.findById(userID, { _id: 0, password: 1 })
      const isPasswordMatch = await bcrypt.compare(oldPassword, Password.password)
      let hashedPassword;
      if (isPasswordMatch) {
        hashedPassword = await bcrypt.hash(newPassword, 10);
        await userModel.findByIdAndUpdate(userID, { $set: { password: hashedPassword } })
        res.json({ message: 'Success' })
      } else {
        res.json({ message: 'error' })
      }
    } catch (error) {
      console.log(error)
    }
  } else if (req.query.task === 'changeinfo') {
    console.log('hi bro', req.body.fullName, req.body.mobileNo)
    const result = await userModel.findByIdAndUpdate(userID, { $set: { userName: req.body.fullName, phoneNo: req.body.mobileNo } });
    console.log(result)
    res.redirect('/Profile')
  }

}
//..................................................................................................................................................

const profileTasks = async (req, res) => {
  try {
    const token = req.cookies.jwtUser; // Assuming token is stored in cookies
    const userID = getUserId(token);
    const newEmail = req.body.newEmailAddress;
    const emailExist = await userModel.find({ emailAddress: newEmail })
    if (emailExist.length === 0) {
      const oldEmail = await userModel.findById(userID, { _id: 0, emailAddress: 1 });
      const emailAddress = oldEmail.emailAddress;
      if (newEmail === oldEmail.emailAddress) {
        res.json({ message: 'SameEmail' })
      } else {
        otp = otpGenerator.generate(6, {
          upperCaseAlphabets: false,
          lowerCaseAlphabets: false,
          specialChars: false,
        })
        let result = await otpModel.findOne({ otp: otp });
        while (result) {
          otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
          });
          result = await otpModel.findOne({ otp: otp });
        }
        const otpPayload = { emailAddress, otp };
        await otpModel.create(otpPayload);
        res.json({ message: 'success' })
      }
    } else {
      res.json({ message: 'AlreadyExist' })
    }
  } catch (error) {
    console.log(error)
  }
}
//..................................................................................................................................................

//..................................................................................................................................................

//Post method for resend Otp 
const resendOtp = async (req, res) => {
  try {
    const emailAddress = globalUser.emailAddress
    console.log(globalUser.emailAddress)
    //generate OTP 
    otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    })
    let result = await otpModel.findOne({ otp: otp });
    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
      });
      result = await otpModel.findOne({ otp: otp });
    }
    const otpPayload = { emailAddress, otp };
    const otpBody = await otpModel.create(otpPayload);
    res.render('user/enterOtp', { message: '', timer: '2:00' })
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}
//..................................................................................................................................................
const MaxExpTime = 3 * 24 * 60 * 60 // expire in 3days


const updateCart = async (req, res) => {
  try {
    const token = req.cookies.jwtUser; // Assuming token is stored in cookies
    const userID = getUserId(token);
    const data = await addtToCartModel.findById(req.body.id).populate('productID')
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
        const updateddata = await addtToCartModel.findByIdAndUpdate(req.body.id, { $set: { quantity: req.body.newQty, totalPrice: data.productID.SalesRate * req.body.newQty, totalMRP: data.productID.MRP * req.body.newQty } })
        res.json(updateddata)
      } else {
        let limit = 'finished'
        res.json(limit)
      }
    } else if (req.body.type === 'decrement') {
      const updateddata = await addtToCartModel.findByIdAndUpdate(req.body.id, { $set: { quantity: req.body.newQty, totalPrice: data.productID.SalesRate * req.body.newQty, totalMRP: data.productID.MRP * req.body.newQty } })
      res.json(updateddata)
    }
  } catch (error) {
    console.log(error)
  }
}

//Section for Post Method End here.....

//.................................................................................................................................................


//export all the above functions
module.exports = {
  profileTasks, generatePDF,logout, profile, profileMenu, shoppingCart, updateCart,saveUserAddress,
  resendOtp,orderDetails, updateProfile, deleteData,
  
}