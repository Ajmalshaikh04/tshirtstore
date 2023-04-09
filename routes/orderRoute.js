const express = require("express");
const router = express.Router();

const {
    createOrder, getOneOrder, getLoggedInOrders, admingetAllOrders, adminUpdateOrder, adminDeleteOrder
} = require("../controllers/orderController");
const { isLoggedIn, customRole } = require("../middlewares/userMiddleware");


router
    .route("/order/create")
    .post(isLoggedIn, createOrder)

router
    .route("/order/:id")
    .get(isLoggedIn, getOneOrder)

router
    .route("/myorder")
    .get(isLoggedIn, getLoggedInOrders)

//admin
router
    .route("/admin/order")
    .get(isLoggedIn, customRole("admin"), admingetAllOrders)
router
    .route("/admin/order/:id")
    .put(isLoggedIn, customRole("admin"), adminUpdateOrder)
    .delete(isLoggedIn, customRole("admin"), adminDeleteOrder)



module.exports = router;