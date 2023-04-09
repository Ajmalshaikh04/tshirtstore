const mongoose = require("mongoose")

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "please provide product name"],
        trim: true,
        maxLength: [120, "Product name should not be greater than 120 characters"]
    },
    price: {
        type: Number,
        required: [true, "plese provide product price"],
        maxLength: [5, "Product price should not be more than 6 digits"]
    },
    description: {
        type: String,
        required: [true, "please provide product description"],
    },
    photos: [
        {
            id: {
                type: String,
                required: true
            },
            secure_url: {
                type: String,
                required: true
            },
        },
    ],
    category: {
        type: String,
        required: [true, "please select Category from - short-sleeves,long-sleeves,sweat-shirts,hoodies"],
        enum: {
            values: [
                "shortsleeves",
                "longsleeves",
                "sweatshirts",
                "hoodies"
            ],
            message: 'please select Category only from - short-sleeves,long-sleeves,sweat-shirts,hoodies '
        }
    },
    stock: {
        type: Number,
        required: [true, "Please add a number in stock"]
    },
    brand: {
        type: String,
        required: [true, "Please add a brand for clothing"]
    },
    ratings: {
        type: Number,
        default: 0
    },
    numberOfReviews: {
        type: Number,
        default: 0
    },
    reviews: [
        {
            user: {
                type: mongoose.Schema.ObjectId,
                ref: "User",
                required: true,
            },
            name: {
                type: String,
                required: true,
            },
            rating: {
                type: Number,
                required: true,
            },
            comment: {
                type: String,
                required: true,
            },
        }
    ],
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
})


module.exports = mongoose.model("Product", productSchema)