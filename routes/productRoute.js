const express = require("express");
const router = express.Router();

const {
    testProduct
} = require("../controllers/productController");
const { isLoggedIn, customRole } = require("../middlewares/userMiddleware");


router.route("/test").post(testProduct);








module.exports = router;