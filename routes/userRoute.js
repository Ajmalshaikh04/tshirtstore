const express = require("express");
const router = express.Router();

const {
    signup,
    login,
    logout,
    forgotPassword,
    passwordReset,
    getLoggedInUserDetails,
    changePassword,
    updateUserDetails,
    adminAllUser,
    managerAllUser,
    adminGetSingleUser,
    adminUpdateUserDetails,
    adminDeleteOneUser,
} = require("../controllers/userController");
const { isLoggedIn, customRole } = require("../middlewares/userMiddleware");

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/forgotpassword").post(forgotPassword);
router.route("/password/reset/:token").post(passwordReset);
router.route("/userdashboard").get(isLoggedIn, getLoggedInUserDetails);
router.route("/password/update").post(isLoggedIn, changePassword);
router.route("/userdashboard/update").put(isLoggedIn, updateUserDetails);

//admin route
router.route("/admin/users").get(isLoggedIn, customRole("admin"), adminAllUser);

router
    .route("/admin/user/:id")
    .get(isLoggedIn, customRole("admin"), adminGetSingleUser)
    .put(isLoggedIn, customRole("admin"), adminUpdateUserDetails)
    .delete(isLoggedIn, customRole("admin"), adminDeleteOneUser);

//manager route
router
    .route("/manager/users")
    .get(isLoggedIn, customRole("manager"), managerAllUser);

module.exports = router;
