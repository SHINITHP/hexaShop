const UserModel = require('../../models/register.js')
const addressModel = require('../../models/address.js')
const addtToCartModel = require('../../models/cart.js')
const appliedCoupon = require('../../models/AppliedCoupon.js')
const subCategorySchema = require('../../models/category.js')
const couponModel = require('../../models/coupon.js')
const orderSummary = require('../../models/orderSummary.js')
const orderSchema = require('../../models/order.js')
const OTPModel = require('../../models/otp.js')
const walletSchema = require('../../models/wallet.js')
const wishlistSchema = require('../../models/wishlist.js')
const productModel = require('../../models/products.js')
const bcrypt = require('bcrypt')
const otpGenerator = require('otp-generator');
const jwt = require('jsonwebtoken');
require('dotenv').config()
const Razorpay = require('razorpay')
const crypto = require('crypto');
const { getUserId, randomToken, generateSimpleUniqueId , generateUniqueFourDigitNumber} = require('../../utils/functions.js')
const path = require('path');
const fs = require('fs-extra')
const easyinvoice = require('easyinvoice')
const puppeteer = require('puppeteer')
// Example usage
const uniqueId = generateSimpleUniqueId();
const pdf = require('html-pdf');
let GlobalUser = {
  userName: "",
  phoneNo: "",
  emailAddress: "",
  password: ""
};

let couponApplied = false, otp;

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAYKEY,
  key_secret: process.env.RAZORPAY_SECRET
});
//..................................................................................................................................................

const onlinPayment = async (req, res) => {
  let amount = req.body.amount;
  const paymentData = {
    amount: amount * 100, // Amount in paise (100 paise = 1 INR)
    currency: 'INR',
    receipt: uniqueId,
  };
  try {
    const response = await razorpay.orders.create(paymentData);
    res.json(response);
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ error: 'Failed to create payment' });
  }
}
//..................................................................................................................................................

const verifyPayment = async (req, res) => {
  const payment = req.body.payment
  const order = req.body.order
  let hmac = crypto.createHash('sha256', process.env.RAZORPAYKEY)
  hmac.update(payment.razorpay_order_id + '|' + payment.razorpay_payment_id)
  hmac = hmac.digest('hex')
  if (hmac == payment.razorpay_signature) {
    res.status(200).send('Payment verified successfully.');
  }
}
//..................................................................................................................................................

//Section for GET Request start here.......
const generatePDF = async (req, res) => {
  try {
    const invoiceNum = generateUniqueFourDigitNumber()
    const date = new Date();
    const formattedDate = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
    const invoiceData = JSON.parse(req.query.data);
    console.log('orders :',invoiceData)
    res.render('user/invoice', { invoiceData ,formattedDate , invoiceNum}, (err, html) => {
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

//show landing page 
const landingPage = async (req, res) => {

  const subCategories = await subCategorySchema.find({})
  const token = req.cookies.jwtUser; // Assuming token is stored in cookies
  const userID = getUserId(token);
  const wishlist = await wishlistSchema.find({ userID: userID })
  const productID = wishlist.map((val) => val.productID)
  let allProducts = await productModel.find({})
  let BrandNames = allProducts.map((val) => val.BrandName)
  let uniqueBrandNames = [...new Set(BrandNames)]; //to filter the unique brandNames

  //to show index page:
  if (req.path == '/') {
    try {
      const ProductData = await productModel.find({})
      res.render('user/index', { ProductData, userId: '', productID })
    } catch (error) {
      console.log(error)
    }
  } else if (req.query.task == 'showAllPro') {

    // console.log('else statement')
    const page = req.query.page;
    const perPage = 4;
    let docCount;
    const ProductData = await productModel.find({})
      .countDocuments()
      .then(documents => {
        docCount = documents;

        return productModel.find({})
          .skip((page - 1) * perPage)
          .limit(perPage)
      })
      .then(ProductData => {
        res.render('user/allProducts', {
          route: 'allProducts',
          ProductData,
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
    const ProductData = await productModel.find({ CategoryName: category })
      .countDocuments()
      .then(documents => {
        docCount = documents;
        return productModel.find({ CategoryName: category })
          .skip((page - 1) * perPage)
          .limit(perPage)
      })
      .then(ProductData => {
        res.render('user/allProducts', {
          route: 'filterCategory',
          ProductData,
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
        const ProductData = await productModel.find({ ProductName: { $regex: searchText } })
          .countDocuments()
          .then(documents => {
            docCount = documents;
            return productModel.find({ ProductName: { $regex: searchText } })
              .skip((page - 1) * perPage)
              .limit(perPage)
          })
          .then(ProductData => {
            console.log('ProductData', ProductData)
            res.render('user/allProducts', {
              route: 'search',
              ProductData,
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
          const ProductData = await productModel.find({
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
            .then(ProductData => {
              console.log('ProductData', ProductData)
              res.render('user/allProducts', {
                route: 'search',
                ProductData,
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

}
//..................................................................................................................................................

const allProductFilter = async (req, res) => {
  const subCategories = await subCategorySchema.find({})
  const token = req.cookies.jwtUser; // Assuming token is stored in cookies
  const userID = getUserId(token);

  console.log(userID)
  const wishlist = await wishlistSchema.find({ userID: userID })
  const productID = wishlist.map((val) => val.productID)
  let allProducts = await productModel.find({})
  let BrandNames = allProducts.map((val) => val.BrandName)
  let uniqueBrandNames = [...new Set(BrandNames)];

  // console.log('i=hi brooo')
  console.log('else statement', req.query.sortOrder)
  const sortOrder = req.query.sortOrder === 'LowToHigh' ? 1 : -1;
  // console.log('sortOrder :', sortOrder)
  const page = req.query.page;
  const perPage = 4;
  let docCount;
  const ProductData = await productModel.find({}).sort({ SalesRate: sortOrder })
    .countDocuments()
    .then(documents => {
      docCount = documents;

      return productModel.find({}).sort({ SalesRate: sortOrder })
        .skip((page - 1) * perPage)
        .limit(perPage)
    })
    .then(ProductData => {
      res.render('user/allProducts', {
        route: 'Sort',
        ProductData,
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
//..................................................................................................................................................

const priceFilter = async (req, res) => {
  let allProducts = await productModel.find({})
  let BrandNames = allProducts.map((val) => val.BrandName)
  let uniqueBrandNames = [...new Set(BrandNames)];
  if (req.query.task === 'priceFilter') {
    try {
      const subCategories = await subCategorySchema.find({})
      const page = req.query.page;
      const perPage = 4;
      let docCount;
      const minimum = req.body.minimum;
      const maximum = req.body.maximum;
      const BrandName = req.body.brandName;
      if (req.query.cat !== '') {
        console.log('BrandName : ', BrandName)
        const ProductData = await productModel.find({
          SalesRate: { $gte: minimum, $lte: maximum },
          CategoryName: req.query.cat,
          BrandName: BrandName
        })
          .countDocuments()
          .then(documents => {
            docCount = documents;

            return productModel.find({
              SalesRate: { $gte: minimum, $lte: maximum },
              CategoryName: req.query.cat,
              BrandName: BrandName
            })
              .skip((page - 1) * perPage)
              .limit(perPage)
          })
          .then(ProductData => {
            res.render('user/allProducts', {
              route: 'priceFilter',
              ProductData,
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
        const ProductData = await productModel.find({
          $or: [
            { SalesRate: { $gte: minimum, $lte: maximum } },
            { BrandName: BrandName }
          ]
        })
          .countDocuments()
          .then(documents => {
            docCount = documents;
            return productModel.find({
              $or: [
                { SalesRate: { $gte: minimum, $lte: maximum } },
                { BrandName: BrandName }
              ]
            })
              .skip((page - 1) * perPage)
              .limit(perPage)
          })
          .then(ProductData => {
            res.render('user/allProducts', {
              route: 'priceFilter',
              ProductData,
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
//..................................................................................................................................................

//Show register page
const registerPage = (req, res) => {
  res.render('user/register')
}
//..................................................................................................................................................

//show enterOTP for registration
const enterOtp = (req, res) => {
  res.render('user/enterOtp', { message: '', timer: '2:00' })
}
//..................................................................................................................................................

// show login page
const loginPage = (req, res) => {
  res.render('user/login', { error: "" })
}
//..................................................................................................................................................

const google = (req, res) => {
  const token = jwt.sign(
    { user: req.user },
    process.env.JWT_SECRET || '',
    { expiresIn: "50h" },
  );
  res.cookie('jwtUser', token);
  res.redirect('/')
}
//..................................................................................................................................................

// show the page to enter the email to send otp when the user forgot password.
const sendEmailOtp = (req, res) => {
  res.render('user/sendEmailOtp', { message: '' })
}
//..................................................................................................................................................

// show forgotEnterOtp page to enter otp
const forgotEnterOtp = (req, res) => {
  res.render('user/forgotEnterOtp', { message: '' })
}
//..................................................................................................................................................

//Show reset password page
const resetPassword = (req, res) => {
  res.render('user/resetPassword')
}
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
  await UserModel.findByIdAndUpdate(userID, { $set: { logged: false } })  // Clear the cookie
  res.redirect('/')
}
//..................................................................................................................................................

const filterProducts = async (req, res) => {
  let allProducts = await productModel.find({})
  let BrandNames = allProducts.map((val) => val.BrandName)
  let uniqueBrandNames = [...new Set(BrandNames)];
  const subCategories = await subCategorySchema.find({})

  if (req.query.subCategory) {
    let subCategory = req.query.subCategory
    let category = req.query.category
    const page = req.query.page;
    const perPage = 4;
    let docCount;
    const ProductData = await productModel.find({ CategoryName: category, subCategory: subCategory })
      .countDocuments()
      .then(documents => {
        docCount = documents;
        return productModel.find({ CategoryName: category, subCategory: subCategory })
          .skip((page - 1) * perPage)
          .limit(perPage)
      })
      .then(ProductData => {
        res.render('user/allProducts', {
          route: 'allProducts',
          ProductData,
          category: '',
          subCategories,
          uniqueBrandNames,
          currentPage: page,
          totalDocuments: docCount,
          pages: Math.ceil(docCount / perPage)
        })
      })
  }

}
//..................................................................................................................................................

//profile
const profile = async (req, res) => {
  const token = req.cookies.jwtUser; // Assuming token is stored in cookies
  const userID = await getUserId(token); // Verify token and get userID 
  try {
    const userInfo = await addressModel.find({ userID: userID }).populate('userID')
    const data = await UserModel.findById(userID).select('-password');
    let userData = data ? [data] : [];
    res.render('user/Profile', { error: '', userInfo, userData })

  } catch (error) {
    console.error('Token verification failed:', error);
  }
}
//..................................................................................................................................................

const profileMenu = async (req, res) => {
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
          if (walletDetails.length > 0) {
            res.render('user/wallet', {
              route: 'wallet',
              walletDetails,
              currentPage: page,
              totalDocuments: docCount,
              pages: Math.ceil(docCount / perPage),
              balance: lastdetails.balance
            })
          } else {
            res.render('user/wallet', {
              route: 'wallet',
              walletDetails,
              currentPage: page,
              totalDocuments: docCount,
              pages: Math.ceil(docCount / perPage),
              balance: ''
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
}
//..................................................................................................................................................

const DeleteData = async (req, res) => {
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
      const UserAddress = {
        addressType, address, pincode,
        state, gender, emailAddress,
        country, cityDistrictTown, phoneNo,
        fullName, userID
      }
      await addressModel.create(UserAddress);
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
    console.log('i am herree ', req.query.id, orderID, optionalReason, reqReason)

    // { $set: { quantity: req.body.newQty
    const value = await orderSchema.findByIdAndUpdate(
      orderID,
      { $set: { requestReason: reqReason, request: true, comment: optionalReason, reqDate: Date.now() } }
    );
    console.log('value : ', value)

  } else if (req.query.type === 'returnOrder') {
    console.log('returnOrder ')
    console.log('helolo hii', req.query.id)

    let optionalComment = req.query.optionalreason === '' ? 'empty' : req.body.optionalreason
    // console.log(optionalComment)
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
    // console.log('wishlist:', req.body.productID, userID)
    try {
      const productID = req.body.productID

      await wishlistSchema.deleteOne({ productID: productID, userID: userID })
      res.json({ message: 'success' })

    } catch (error) {
      console.log(error)
    }
  }
}
//..................................................................................................................................................

const checkOut = async (req, res) => {
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
}
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

const updateCheckout = async (req, res) => {
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
}
//..................................................................................................................................................

const checkOutTasks = async (req, res) => {
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
          deliveryCharge:req.body.deliveryCharge
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

      res.json({message:'success'})
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
          deliveryCharge:req.body.deliveryCharge
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

}
//..................................................................................................................................................


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
//..................................................................................................................................................

const updateProfile = async (req, res) => { 
  const token = req.cookies.jwtUser; // Assuming token is stored in cookies
  const userID = getUserId(token); // Verify token and get userID
  const oldEmail = await UserModel.findById(userID, { _id: 0, emailAddress: 1 });
  const emailAddress = oldEmail.emailAddress;
  if (req.query.task === 'checkEmailotp') {
    try { 
      const newOTP = req.body.NewOTP
      const newEmail = req.body.newEmail;
      const response = await OTPModel.find({ emailAddress }).sort({ createdAt: -1 }).limit(1);  
      if (newOTP === response[0].otp) {
        await UserModel.findByIdAndUpdate(userID, { $set: { emailAddress: newEmail } })
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
      const Password = await UserModel.findById(userID, { _id: 0, password: 1 }) 
      const isPasswordMatch = await bcrypt.compare(oldPassword, Password.password)
      let hashedPassword;
      if (isPasswordMatch) { 
        hashedPassword = await bcrypt.hash(newPassword, 10); 
        await UserModel.findByIdAndUpdate(userID, { $set: { password: hashedPassword } })
        res.json({ message: 'Success' })
      } else {
        res.json({ message: 'error' })
      } 
    } catch (error) {
      console.log(error)
    }
  } else if (req.query.task === 'changeinfo') {
    console.log('hi bro', req.body.fullName, req.body.mobileNo) 
    const result = await UserModel.findByIdAndUpdate(userID, { $set: { userName: req.body.fullName, phoneNo: req.body.mobileNo } });
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
    const emailExist = await UserModel.find({ emailAddress: newEmail }) 
    if (emailExist.length === 0) {
      const oldEmail = await UserModel.findById(userID, { _id: 0, emailAddress: 1 }); 
      const emailAddress = oldEmail.emailAddress;
      if (newEmail === oldEmail.emailAddress) {
        res.json({ message: 'SameEmail' })
      } else {
        otp = otpGenerator.generate(6, {
          upperCaseAlphabets: false,
          lowerCaseAlphabets: false,
          specialChars: false,
        }) 
        let result = await OTPModel.findOne({ otp: otp });
        while (result) {
          otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
          });
          result = await OTPModel.findOne({ otp: otp });
        }
        const otpPayload = { emailAddress, otp };
        await OTPModel.create(otpPayload);
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
 
//send OTP for the registration of user 
const sentOTP = async (req, res) => {
  try {
    //requesting the data from the body and assigning that data to a global variable.
    GlobalUser.userName = req.body.userName
    GlobalUser.phoneNo = req.body.phoneNo
    GlobalUser.emailAddress = req.body.emailAddress
    GlobalUser.password = req.body.password

    const emailAddress = GlobalUser.emailAddress 
    const checkUserPresent = await UserModel.findOne({ emailAddress });// Check if user is already present
    
    if (checkUserPresent) {// If user found with provided email
      return res.status(401).json({
        success: false,
        message: 'User is already registered',
      });
    }
    //generate OTP 
    otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    })
    //just check the otp is correct 
    let result = await OTPModel.findOne({ otp: otp });
    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
      });
      result = await OTPModel.findOne({ otp: otp });
    }
    //save the otp to the database
    const otpPayload = { emailAddress, otp };
    await OTPModel.create(otpPayload);
    res.render('user/enterOtp', { message: '', timer: '2:00' })//render the enterotp page
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}
//..................................................................................................................................................

//Post method for resend Otp 
const resendOtp = async (req, res) => {
  try {
    const emailAddress = GlobalUser.emailAddress
    console.log(GlobalUser.emailAddress)
    //generate OTP 
    otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    })
    let result = await OTPModel.findOne({ otp: otp });
    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
      });
      result = await OTPModel.findOne({ otp: otp });
    }
    const otpPayload = { emailAddress, otp };
    const otpBody = await OTPModel.create(otpPayload);
    res.render('user/enterOtp', { message: '', timer: '2:00' })
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}
//..................................................................................................................................................
const MaxExpTime = 3 * 24 * 60 * 60 // expire in 3days
//save the user data to mongodb when the user enter the correct otp.
const createUser = async (req, res) => {
  let timer = req.body.Timer;
  console.log(req.body.otp)
  try {
    const emailAddress = GlobalUser.emailAddress
    const password = GlobalUser.password

    const { otp1, otp2, otp3, otp4, otp5, otp6 } = req.body
    const combinedOTP = otp1 + otp2 + otp3 + otp4 + otp5 + otp6; 
    const response = await OTPModel.find({ emailAddress }).sort({ createdAt: -1 }).limit(1); 
    if (combinedOTP !== response[0].otp) { 
      res.render('user/enterOtp', { message: 'Invalid OTP', timer: '2:00' })
    } else { 
      let hashedPassword;
      try {
        hashedPassword = await bcrypt.hash(password, 10);
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: `Hashing password error for ${password}: ` + error.message,
        });
      }
      // hash the password
      GlobalUser.password = hashedPassword
      //store the user data to mongodb
      const createdUser = await UserModel.create(GlobalUser); 
      const Token = randomToken(createdUser._id)
      res.cookie('jwtUser', Token, { httpOnly: true, maxAge: MaxExpTime * 1000 }); 
      res.redirect('/')
    }

  } catch (error) { 
    res.render('user/enterOtp', { message: 'OTP Time Out', timer: timer })
  }
}
//..................................................................................................................................................

//post method for login page
const userLogin = (async (req, res) => {
  try {
    const { emailAddress, password } = req.body
    const userExist = await UserModel.findOne({ emailAddress: emailAddress });
    //check the user is exist or not
    if (userExist) {
      const isPasswordMatch = await bcrypt.compare(password, userExist.password)
      if (isPasswordMatch) {
        if (userExist.status === true) { 
          const Token = randomToken(userExist._id)
          console.log(Token)
          res.cookie('jwtUser', Token, { httpOnly: true, maxAge: MaxExpTime * 1000 });
          await UserModel.findByIdAndUpdate(userExist._id, { $set: { logged: true } }) 
          res.redirect('/') 
        }
        else {
          res.render('user/login', { error: "User Blocked!" })
        }
      } else {
        res.render('user/login', { error: "Wrong Password!" })
      }
    } else {
      res.render('user/login', { error: "Entered  Email Address is wrong!" })
    }
  } catch (error) {
    console.log(error);
    res.render('user/login', { error: "Error while login" })
  }
})
//..................................................................................................................................................

//post method for sendEmailOtp page for forgotPassword
const postsendEmailOtp = async (req, res) => {
  try {
    GlobalUser.emailAddress = req.body.emailAddress
    const emailAddress = GlobalUser.emailAddress 
    const checkUserPresent = await UserModel.findOne({ emailAddress });
    console.log(checkUserPresent);
    if (checkUserPresent) { 
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      })
      let result = await OTPModel.findOne({ otp: otp });
      while (result) {
        otp = otpGenerator.generate(6, {
          upperCaseAlphabets: false,
        });
        result = await OTPModel.findOne({ otp: otp });
      }
      const otpPayload = { emailAddress, otp };
      await OTPModel.create(otpPayload);
      res.redirect('/forgotEnterOtp')
    } else {
      res.render('user/sendEmailOtp', { message: 'User not found !' })
    }

  } catch (error) {
    console.log('connection Error : ', error);
  }
}
//..................................................................................................................................................

// post method for forgotEnterOtp page for forgotpassword
const postForgotEnterOtp = async (req, res) => {
  try {
    const emailAddress = GlobalUser.emailAddress
    const { otp1, otp2, otp3, otp4, otp5, otp6 } = req.body
    const combinedOTP = otp1 + otp2 + otp3 + otp4 + otp5 + otp6;

    const response = await OTPModel.find({ emailAddress }).sort({ createdAt: -1 }).limit(1);  
    if (response.length === 0 || combinedOTP !== response[0].otp) {
      res.render('user/enterOtp', { message: 'Invalid OTP', timer: '2:00' })
    } else {
      res.redirect('/resetPassword')
    }
  } catch (error) {
    console.log(error)
  }
}
//..................................................................................................................................................

//to save the updated user password
const createPassword = async (req, res) => {
  try {
    const emailAddress = GlobalUser.emailAddress
    const password = req.body.password 
    const response = await OTPModel.find({ emailAddress }).sort({ createdAt: -1 }).limit(1);
    if (response.length === 0 || otp !== response[0].otp) {
      return res.status(400).json({
        success: false,
        message: 'The OTP is not valid',
      });
    }
    const user = await UserModel.findOne({ emailAddress });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    // // Secure password
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 10);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: `Hashing password error for ${password}: ` + error.message,
      });
    }
    // hash the password
    user.password = hashedPassword
    await user.save();
    res.render('user/login', { error: 'Reset Password Successful' })
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}
//..................................................................................................................................................

//get method for product overview
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
  registerPage, removeCartProduct, updateCheckout, landingPage, loginPage, userLogin,
  logout, profile, profileMenu, google, shoppingCart, updateCart, sendEmailOtp, postsendEmailOtp,
  forgotEnterOtp, postForgotEnterOtp, resetPassword, createPassword, saveUserAddress, filterProducts,
  enterOtp, sentOTP, createUser, resendOtp, productOverview, saveImage, overviewFilter, checkOut,
  checkOutTasks, orderDetails, updateProfile, onlinPayment, verifyPayment, priceFilter, DeleteData,
  profileTasks, generatePDF, allProductFilter
}