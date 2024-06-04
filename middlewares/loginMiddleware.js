const jwt = require('jsonwebtoken')
require('dotenv').config()

const loginAuth = async (req, res, next) => {
    // console.log('jwt token : ', req.cookies.jwtUser, '233wjn3iuui3232  f ', process.env.JWT_SECRET);
    const token = req.cookies.jwtUser;
   
    if (token) {
        //  console.log('no token')
        try {
           
            jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
              
                if (err) {
                    res.render('user/login', { error: " login error " })
                }
               res.redirect('/')
            })

        } catch (error) {
            res.render('user/login', { error: "Error while Login" })
        }
    } else {
      
        res.render('user/login',{error:''})
        // res.render('user/login', { error: "Error while Login" })
    }

}


module.exports = {
    loginAuth
}