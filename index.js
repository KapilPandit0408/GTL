const express     = require("express")
const app         = require('express')();
const bodyParser  = require('body-parser');
const mongoose    = require('mongoose')
const userRoute   = require("./Router/userRoute")
const device      = require('express-device');
const useragent   = require('express-useragent');
const path        = require('path');

require("dotenv").config();

app.use(useragent.express());
app.enable('trust proxy')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.urlencoded({extended:true}));
app.use('/public', express.static(path.join(__dirname, '/public')));

//Connection string 
const url = process.env.MONGO_URL || "mongodb://localhost:27017/two_factor";

//Db connection
mongoose.connect(url,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
    }) 
    .then(() => console.log('Connected to MongoDB successfully....'))
    .catch(err => console.error('Could not be connect to MongoDB....'));

app.use(device.capture());
app.use("/", userRoute)

let  port = process.env.PORT || 3000
app.listen(port, ()=> {
  console.log(`Server started on ${port}`)
});