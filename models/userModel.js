const mongoose = require("mongoose")
const validator = require("validator")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please provide a name"],
        maxLength: [40, "Name should be under 40 character"]
    },
    email: {
        type: String,
        required: [true, "Please Provide an Email"],
        validate: [validator.isEmail, "Please enter a valid Email"],
        unique: true
    },
    password: {
        type: String,
        required: [true, "Please Provide a Password"],
        minLength: [6, "Password should be atleast 6 char"],
        select: false
    },
    role: {
        type: String,
        default: "user"
    },
    photo: {
        id: {
            type: String,
            required: true
        },
        secure_url: {
            type: String,
            required: true
        }
    },
    forgotPasswordToken: String,
    forgotPasswordExpiry: Date,
    createdAt: {
        type: Date,
        default: Date.now,
    }
})

//encrypt password before save
//this is mongoose middleware //this will run before saving password
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next()
    this.password = await bcrypt.hash(this.password, 10)
})

//validate the password with passed on user password
userSchema.methods.validatePassword = async function (userEnteredPassword) {
    return await bcrypt.compare(userEnteredPassword, this.password)
}

//create and return jwt token
userSchema.methods.getJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRY
    })
}

//generate forgot password token (string)
userSchema.methods.getForgotPasswordToken = function () {
    //generate a long and random string
    const forgotToken = crypto.randomBytes(20).toString("hex")

    // this.forgotPasswordToken = forgotToken
    //getting a hash - make sure to get a hash on backend
    this.forgotPasswordToken = crypto
        .createHash("sha256")
        .update(forgotToken)
        .digest("hex")

    //time of token
    this.forgotPasswordExpiry = Date.now() + 20 * 60 * 1000
    return forgotToken
}


module.exports = mongoose.model("User", userSchema) 