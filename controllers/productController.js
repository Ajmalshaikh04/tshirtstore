const BigPromise = require("../middlewares/bigPromise");
const Product = require("../models/productModel");
const CustomError = require("../utils/customError");
const WhereClause = require("../utils/whereClause");
const cloudinary = require("cloudinary").v2;

exports.getAllProduct = BigPromise(async (req, res, next) => {
    const resultPerPage = 6;
    const totalCountProduct = await Product.countDocuments();

    // const products = Product.find({})
    const productsObj = new WhereClause(Product.find(), req.query)
        .search()
        .filter();

    let products = await productsObj.base; //find product
    const filteredProductNumber = products.length;

    productsObj.pagination(resultPerPage);
    products = await productsObj.base.clone();

    res.status(200).json({
        success: true,
        products,
        filteredProductNumber,
        totalCountProduct,
    });
});

exports.getSingleProduct = BigPromise(async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(new CustomError("No Product found with this id", 401));
    }
    res.status(200).json({
        success: true,
        product,
    });
});

//admin only controller
exports.addProduct = BigPromise(async (req, res, next) => {
    //images
    let imageArray = [];
    if (!req.files) {
        next(new CustomError("Images are required ", 401));
    }

    console.log(req.files);

    if (req.files.photos.length > 1) {
        for (let index = 0; index < req.files.photos.length; index++) {
            result = await cloudinary.uploader.upload(
                req.files.photos[index].tempFilePath,
                {
                    folder: "lcoproducts",
                }
            );
            imageArray.push({
                id: result.public_id,
                secure_url: result.secure_url,
            });
        }
    } else {
        result = await cloudinary.uploader.upload(
            req.files.photos.tempFilePath,
            {
                folder: "lcoproducts",
            }
        );
        imageArray.push({
            id: result.public_id,
            secure_url: result.secure_url,
        });
    }

    req.body.photos = imageArray;
    req.body.user = req.user.id;

    const product = await Product.create(req.body);

    res.status(200).json({
        success: true,
        product,
    });
});

exports.adminGetAllProduct = BigPromise(async (req, res, next) => {
    const products = await Product.find({});

    res.status(200).json({
        success: true,
        products,
    });
});

exports.adminUpdateSingleProduct = BigPromise(async (req, res, next) => {
    let product = await Product.findById(req.params.id);

    if (!product) {
        return next(new CustomError("Product not found", 404));
    }

    let imagesArray = [];
    console.log(product);
    if (product.photos) {
        //destroy the existing product img
        for (let index = 0; index < product.photos.length; index++) {
            let result = await cloudinary.uploader.destroy(
                product.photos[index].id
            );
        }


        //upload and save the existing product img
        if (req.files.photos.length > 1) {
            for (let index = 0; index < req.files.photos.length; index++) {
                let result = await cloudinary.uploader.upload(
                    req.files.photos[index].tempFilePath,
                    {
                        folder: "lcoproducts",
                    }
                );
                imagesArray.push({
                    id: result.public_id,
                    secure_url: result.secure_url,
                });
            }
        } else {
            result = await cloudinary.uploader.upload(
                req.files.photos.tempFilePath,
                {
                    folder: "lcoproducts",
                }
            );

            imagesArray.push({
                id: result.public_id,
                secure_url: result.secure_url,
            });
        }
        req.body.photos = imagesArray;
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success: true,
        product,
    });
});

exports.adminDeleteSingleProduct = BigPromise(async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(new CustomError("No Product found with this Id", 401));
    }

    for (let index = 0; index < product.photos.length; index++) {
        await cloudinary.uploader.destroy(product.photos[index].id);
    }

    await product.remove();

    res.status(200).json({
        success: true,
        message: "Product deleted! ",
    });
});

exports.addReview = BigPromise(async (req, res, next) => {
    const { rating, comment, productId } = req.body

    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment,
    }

    const product = await Product.findById(productId)

    const AlreadyReview = product.reviews.find((rev) => rev.user.toString() === req.user._id.toString())

    if (AlreadyReview) {
        product.reviews.forEach((review) => {
            if (review.user.toString() === req.user._id.toString()) {
                review.comment = comment
                review.rating = rating
            }
        })
    } else {
        product.reviews.push(review)
        product.numberOfReviews = product.reviews.length
    }


    //adjust rating
    product.ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length

    //save 
    await product.save({ validateBeforeSave: false })

    res.status(200).json({
        success: true,
    });
});

exports.deleteReview = BigPromise(async (req, res, next) => {
    const { productId } = req.query;

    const product = await Product.findById(productId)

    const reviews = product.reviews.filter(
        (rev) => rev.user.toString() === req.user._id.toString()
    )

    const numberOfReviews = reviews.length

    product.ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length

    //update the product reviews

    await Product.findByIdAndUpdate(productId, {
        reviews,
        ratings,
        numberOfReviews
    }, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success: true
    })
})

exports.getOnlyReviewsForProduct = BigPromise(async (req, res, next) => {
    const product = await Product.findById(req.query.id)

    res.status(200).json({
        success: true,
        reviews: product.reviews
    })
})