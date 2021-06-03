
const mongoose   = require("mongoose");

const userSchema = new mongoose.Schema({
    socialId:String,
    socialIdType:String,
    firstname: String,
    lastname:String,
    email: String,
    dob:Date,
    countrycode:String,
    mobile:{type :String, minlength: 10, maxlength: 11},
    gender:String,
    macAddress:String,
    deviceName:String,
    os:String,
    platform:String,
    appVersion:String,
    image:String
});
module.exports=  User = mongoose.model("User", userSchema);