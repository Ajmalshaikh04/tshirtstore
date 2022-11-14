const express = require("express")
const router = express.Router()


const { signup, login, logout, forgotPassword, passwordReset, getLoggedInUserDetails, changePassword, updateUserDetails } = require("../controllers/userController")
const { isLoggedIn } = require("../middlewares/userMiddleware")

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/forgotpassword").post(forgotPassword);
router.route("/password/reset/:token").post(passwordReset);
router.route("/userdashboard").get(isLoggedIn, getLoggedInUserDetails);
router.route("/password/update").post(isLoggedIn, changePassword);
router.route("/userdashboard/update").put(isLoggedIn, updateUserDetails);

module.exports = router