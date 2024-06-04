const express = require('express')
const app = express()
const path = require('path')
const cookieParser = require('cookie-parser')
const methodOverride = require('method-override')
const passport = require('passport')
const session = require('express-session');
const passportSetup = require('./controller/user/googleOuath.js')
require('dotenv').config()
const fetch = require('node-fetch'); 

const userRouter = require("./routes/user/userRoutes")
const adminRoutes = require('./routes/admin/adminRoutes.js')

app.set("view engine","ejs")
app.use(express.static(path.join(__dirname,"public"))); 
app.use(express.json({ limit: '50mb' }));
// Increase payload size limit for URL-encoded data (e.g., 50 MB)
app.use(express.urlencoded({ limit: '50mb', extended: false }));

app.use(cookieParser());

app.use(session({
    secret:process.env.COOKIES_KEY,
    resave: false,
    saveUninitialized: false
  }));

//passport
app.use(passport.initialize());
app.use(passport.session());

// override with POST having ?_method=DELETE
app.use(methodOverride('_method'))  

app.use('/',userRouter);
app.use('/adminLogin',adminRoutes)

// app.get('*', (req, res) => {
//   res.render('user/404Error')
// })


app.get('/sample', (req, res) => {
  res.render('user/invoice')
})

const port = process.env.port||8000
app.listen(port,(err)=>{
    if(err) console.log(err);
    console.log(`Server running successfully on the port ${port}`); 
})