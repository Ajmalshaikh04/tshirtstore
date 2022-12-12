const express = require("express");
const router = express.Router();

const {
    addProduct,
    getAllProduct,
    adminGetAllProduct,
    getSingleProduct,
    adminUpdateSingleProduct,
    adminDeleteSingleProduct,
    addReview,
    deleteReview,
    getOnlyReviewsForProduct,
} = require("../controllers/productController");
const { isLoggedIn, customRole } = require("../middlewares/userMiddleware");

//user routes
router
    .route("/products")
    .get(getAllProduct);
router
    .route("/product/:id")
    .get(getSingleProduct);
router
    .route("/review")
    .put(isLoggedIn, addReview)
    .delete(isLoggedIn, deleteReview);
router
    .route("/reviews").get(getOnlyReviewsForProduct)

//admin routes
router
    .route("/admin/product/add")
    .post(isLoggedIn, customRole("admin"), addProduct);
router
    .route("/admin/products")
    .get(isLoggedIn, customRole("admin"), adminGetAllProduct);
router
    .route("/admin/product/:id")
    .put(isLoggedIn, customRole("admin"), adminUpdateSingleProduct)
    .delete(isLoggedIn, customRole("admin"), adminDeleteSingleProduct);

module.exports = router;
