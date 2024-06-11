const passport = require('passport'); 
const GoogleStrategy = require('passport-google-oauth20').Strategy;
require('dotenv').config()
const usermodel = require('../models/register.js')


//session cookies
passport.serializeUser((user, done) => { 
    // console.log('hi ID is here : ',user.id);
  done(null, user.id); 
}); 

passport.deserializeUser((id, done) => { 
    usermodel.findById(id).then((User) => {
        done(null, User);
    })
}); 



passport.use( 
  new GoogleStrategy( 
    { 
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      clientID: process.env.GOOGLECLIENT, 
      clientSecret: process.env. GOOGLE_CLIENT_SECRET
      
    //   passReqToCallback: true
    },
    (accessToken, refreshToken, profile, done) => { 
      // User find or create to db 
    //    done(null, profile); 
    console.log('1232131412 ',profile)

    usermodel.findOne({emailAddress:profile.emails[0].value})
    .select("-password")
    .then((userExist) => {
        if(userExist){
            console.log(userExist);
            done(null,userExist)
        }else{
            new usermodel({
                googleId:profile.id,
                userName:profile.displayName,
                emailAddress:profile.emails[0].value
            }).save().then((newUser) => {
                console.log('new user created : ',newUser);
                done(null,newUser)
            })
        }
    })

    } 
  ) 
); 



