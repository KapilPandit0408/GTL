const router        = require("express").Router();
const auth          = require("../Middleware/userAuth")
const controller    = require("../controller/all")
const path          = require('path');
const multer        = require('multer');
const { UserAgent } = require("express-useragent");


var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public')
  },
  filename: function (req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
})
const upload = multer({ storage });


router.post('/guest', controller.guest)
router.get("/guestaccess", auth, controller.guestaccess)

router.post('/sendotp', controller.sendotp);
router.post('/verify', controller.verify);
router.post('/login', controller.login);
router.post('/register', controller.register);
router.get("/user/profile", auth,  controller.profile);
router.put("/profile/image", auth, upload.single('image'), controller.image);

module.exports = router;