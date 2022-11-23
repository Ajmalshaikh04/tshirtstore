const BigPromise = require("../middlewares/bigPromise")
const Product = require("../models/productModel")
const CustomError = require("../utils/customError");
const WhereClause = require("../utils/whereClause");
const cloudinary = require("cloudinary").v2;

exports.addProduct = BigPromise(async (req, res, next) => {
    //images

    let imageArray = []
    if (!req.files) {
        next(new CustomError("Images are required ", 401))
    }

    if (req.files) {
        for (let index = 0; index < req.files.photos.length; index++) {
            const result = cloudinary.uploader.upload(req.files.photos[index].tempFilePath, {
                folder: "products"
            });

            imageArray.push({
                id: result.public_id,
                secure_url: result.secure_url
            })
        }
    }

    req.body.photos = imageArray
    req.body.user = req.user.id

    const product = await Product.create(req.body)

    res.status(200).json({
        success: true,
        product
    })
})

exports.getAllProduct = BigPromise(async (req, res, next) => {

    const resultPerPage = 6
    const totalCountProduct = await Product.countDocuments()

    // const products = Product.find({})
    const products = new WhereClause(Product.find(), req.query).search().filter()
    const filteredProductNumber = products.length

    products.pagination(resultPerPage)
    products = await products.base


    res.status(200).json({
        success: true,
        products,
        filteredProductNumber,
        totalCountProduct
    })
})