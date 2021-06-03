const router        = require("express").Router();
const jwt           = require("jsonwebtoken");
const Nexmo         = require('nexmo');
const User          = require("../models/user")
const getmac        = require('getmac')
const request       = require('request-promise');



var admin = require("firebase-admin");

var serviceAccount = require("C:/Users/ksp35/Desktop/GLT N - Copy/secret_file.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:"https://fcmnotificationsanvi.firebaseio.com"
});

const deviceToken = ["Put here our device token"];

const payload = {
  notification: {
    title:"Notification Title",
    body:"Notification content"
  }
};
const options = {
  priority:"high",
  timeToLive: 60 *60 *24
};
admin.messaging().sendToDevice(deviceToken, payload, options)
  .then((res) => {
    console.log("message sent", res);
  })
  .catch((error) => {
    console.log("Error", error)
  })





require("dotenv").config();

const nexmo = new Nexmo({ 
    apiKey: process.env.NEXMO_API_KEY,
    apiSecret: process.env.NEXMO_API_SECRET
});





exports.sendotp = async (req, res) => {
    const mobile          = req.body.mobile
    const countrycode     = req.body.countrycode
    const socialIdType    = req.body.socialIdType
    const socialId        = req.body.socialId
    const number          = countrycode.concat(mobile)
    nexmo.verify.request({
      number: number,
      brand: 'GLT '
    }, async (error, result) => {
      if(result.status != 0 && result.status != 10) {
        res.status(400).json({ message: result.error_text })
      } else {
        const user = await User.findOne({ mobile: mobile })
        if(user) {
          if(user.countrycode === countrycode)
            if( socialId === user.socialId) {
                if(socialIdType === user.socialIdType) {
                    res.status(200).json({message:"Social User found", userData: {status:true, socialId:socialId, socialIdType:socialIdType, requestId: result.request_id} });
                  }
            }
            else {
                res.status(200).json({message:"Mobile User found", userData: {status:true, requestId: result.request_id} });
            }
        }
        else {
          res.json({message:"User not found", userData: {status:false, requestId: result.request_id}})
        }  
      }
    })
  }

  exports.verify = async (req, res) => {
    nexmo.verify.check({
      request_id: req.body.requestId,
      code: req.body.code
    }, async (error, result) => {
      if(result.status != 0) {
        res.status(400).json({ message: result.error_text })
      } else {
        res.status(200).json({message:"Mobile Number verified"}) 
      }
    })
  }

  exports.login = async (req, res) => {
    const appVersion      = req.body.appVersion
    const os              = req.useragent.os
    const platform        = req.useragent.platform
    const macAddress      = getmac.default()
    const deviceName      = req.device.type.toUpperCase()
    const countrycode     = req.body.countrycode
    const mobile          = req.body.mobile;
    const socialIdType    = req.body.socialIdType
    const socialId        = req.body.socialId

    const user            = await User.findOne({ mobile: mobile })
      if(countrycode === user.countrycode)  {
        const id            = user._id
        await User.findByIdAndUpdate(user._id, {$set:{appVersion:appVersion,os:os,macAddress:macAddress,deviceName:deviceName,platform:platform}})
        const updatedUser = await User.findById(id)
        const token = jwt.sign({ id: user._id }, process.env.TOKEN_SECRET_KEY)
        res.status(200).json({token,userData:{user:updatedUser}});
      }
      else {
        const user = await User.findOne({socialIdType:socialIdType})
        if(user.socialId === socialId) {
          await User.findByIdAndUpdate(user._id, {$set:{os:os,macAddress:macAddress,deviceName:deviceName,platform:platform}})
          const updatedUser = await User.findById(id)
          const token = jwt.sign({ id: user._id }, process.env.TOKEN_SECRET_KEY)
          res.status(200).json({token,userData:{user:updatedUser}});
        }
      }
  }

  exports.register = async (req, res) => {
    const appVersion      = req.body.appVersion
    const socialIdType    = req.body.socialIdType
    const socialId        = req.body.socialId
    const os              = req.useragent.os
    const platform        = req.useragent.platform
    const macAddress      = getmac.default()
    const deviceName      = req.device.type.toUpperCase()

    const { firstname, lastname, email, dob, mobile, gender, countrycode } = req.body
    if(!firstname || !lastname || !email || !dob || !mobile || !countrycode)
        res.status(404).json({msg:"Please Enter All Field"});
    let regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (emailAdress.match(regexEmail) == false) 
        res.status(400).json({msg:"Please Enter valid Email"});
    if(mobile.length < 10 || mobile.length > 11)
        res.status(400).json({msg:"Please Enter valid Mobile"});

      const newUser = new User({
        socialIdType,
        socialId,
        firstname,
        lastname,
        email,
        dob,
        mobile,
        countrycode,
        gender,
        macAddress,
        deviceName,
        os,
        platform,
        appVersion
      })
      const savedUser = await newUser.save()
      res.status(200).json({msg:'User created successfully'});
    
  }

  exports.image = async (req, res) => {
    const id = req.user
    const url = req.file.path
    // const filename = req.file.filename
    // const image = {url:url, filename:filename}
    // console.log(id)
    // console.log(image);
    User.findByIdAndUpdate(id, {$set:{image:url}},  (err, user) => {
        if(err) {
            res.send(err);
        }
        else {
          User.findById(id,(err,user)=>{
              if(err){
                  res.status(400).json(err)
              }
              else
              {
                  res.status(200).json({user});
              }
          });               
        }
    });
  }

  exports.profile = async (req, res, next) => {
    const user = await User.findById(req.user);
    res.status(200).json({user:user})
    next()
  }



  exports.guest = async (req, res) => {
    const appVersion      = req.body.appVersion
    const os              = req.useragent.os
    const platform        = req.useragent.platform
    const macAddress      = getmac.default()
    const deviceName      = req.device.type
    const newUser         = new User({ macAddress, deviceName, os, platform, appVersion })
    const savedUser       = await newUser.save()
    const token           = jwt.sign({ id: savedUser._id }, process.env.TOKEN_SECRET_KEY, {expiresIn: '48h' })
    res.status(200).json({token, msg: "guest user login is done"})
}

 exports.guestaccess = async (req, res, next) => {
    const id = req.user;
    const user = await User.findById(id);
    const token = jwt.sign({ id: user._id }, process.env.TOKEN_SECRET_KEY)
    res.status(200).json({token, user, msg:"you are guest user"})
    next()
  }