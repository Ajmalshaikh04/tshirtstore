const User = require("../models/userModel")
const BigPromise = require("../middlewares/bigPromise")
const CustomError = require("../utils/customError")
const cookieToken = require("../utils/cookieToken")
const emailHelper = require("../utils/emailhelper")
const cloudinary = require("cloudinary").v2;
const crypto = require("crypto")

exports.signup = BigPromise(async (req, res, next) => {

    // let result;

    // if (!req.files) {
    //     let file = req.files.photo
    //     result = await cloudinary.uploader.upload(file.tempFilePath, {
    //         folder: "users",
    //         width: 150,
    //         crop: "scale"
    //     })
    // }

    if (!req.files) {
        return next(new CustomError("Photo is required for signup", 400))
    }
    const { name, email, password } = req.body

    if (!email || !name || !password) {
        return next(new CustomError("Name ,Email,password is required", 400))
    }
    let file = req.files.photo
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
        folder: "users",
        width: 150,
        crop: "scale"
    })

    const user = await User.create({
        name,
        email,
        password,
        photo: {
            id: result.public_id,
            secure_url: result.secure_url
        }
    })

    cookieToken(user, res)


})

exports.login = BigPromise(async (req, res, next) => {
    const { email, password } = req.body

    //check for presence of email and password
    if (!email || !password) {
        return next(new CustomError("Please Provide email and password", 400))
    }
    //get user from db
    const user = await User.findOne({ email }).select("+password")

    //if no user found in db
    if (!user) {
        return next(new CustomError("Email or password does not match or exist", 400))
    }

    //match the password
    const isPasswordCorrect = await user.validatePassword(password)

    //if password donot match
    if (!isPasswordCorrect) {
        return next(new CustomError("Email or password does not match or exist", 400))
    }

    //if all goes good ,send the token
    cookieToken(user, res)
})


exports.logout = BigPromise(async (req, res, next) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })
    res.status(200).json({
        success: true,
        message: "Logout Successfully"
    })
})

exports.forgotPassword = BigPromise(async (req, res, next) => {
    //collect email
    const { email } = req.body

    //find user in db
    const user = await User.findOne({ email })
    //if user not  found in db
    if (!user) {
        return next(new CustomError("User not Found with this Email", 400))
    }

    //get token from user model method
    const forgotToken = user.getForgotPasswordToken()

    //save user feilds in Db
    await user.save({ validateBeforeSave: false })

    //create a url 
    const myUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${forgotToken}`

    //craft a message which will go in emailhelper
    const message = `Copy paste this link in your URL and hit enter \n\n ${myUrl}`

    //sending email to user for  forgotpassword to reset its password    
    try {
        await emailHelper({
            email: user.email,
            subject: "Tshirtstore - Password Reset email",
            //this message is comming from above defined message
            message,
        })
        //json respose if email is success
        res.status(200).json({
            success: true,
            message: "Email sent Successfully"
        })

    } catch (error) {
        //reset user fields if things goes wrong
        user.forgotPasswordToken = undefined
        user.forgotPasswordExpiry = undefined

        await user.save({ validateBeforeSave: false })

        //this error message is comming from Customerror
        return next(new CustomError(error.message, 500))
    }
})

exports.passwordReset = BigPromise(async (req, res, next) => {
    //grab a token
    const token = req.params.token

    const encryptToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex")


    const user = await User.findOne({
        encryptToken,
        forgotPasswordExpiry: { $gt: Date.now() }
    })

    if (!user) {
        return next(new CustomError("Token is invalid or expired", 400))
    }

    if (req.body.password != req.body.confirmPassword) {
        return next(new CustomError('Password and ConfirmPassword do not match', 400))
    }

    user.password = req.body.password

    user.forgotPasswordToken = undefined
    user.forgotPasswordExpiry = undefined

    await user.save()

    //send a json response or send a token
    cookieToken(user, res)
})

exports.getLoggedInUserDetails = BigPromise(async (req, res, next) => {
    //req.user will be added by middleware
    //find user by id
    const user = await User.findById(req.user.id)

    //send response and user data
    res.status(200).json({
        success: true,
        user
    })

})

exports.changePassword = BigPromise(async (req, res, next) => {
    const userId = req.user.id

    const user = await User.findById(userId).select("+password")

    const isOldPasswordCorrect = await user.validatePassword(req.body.oldPassword)

    if (!isOldPasswordCorrect) {
        return next(new CustomError("Old Password is not correct", 400))
    }
    user.password = req.body.password

    await user.save()

    cookieToken(user, res)

})


exports.updateUserDetails = BigPromise(async (req, res, next) => {

    const newData = {
        name: req.body.name,
        email: req.body.email
    }

    if (req.files) {
        const user = await User.findById(req.user.id)

        const imageId = user.photo.id
        //delete photo from cloudinary
        const resp = await cloudinary.uploader.destroy(imageId)

        //update new photo
        const result = await cloudinary.uploader.upload(req.files.photo.tempFilePath, {
            folder: "users",
            width: 150,
            crop: "scale"
        })
        newData.photo = {
            id: result.public_id,
            secure_url: result.secure_url
        }

    }

    const user = await User.findByIdAndUpdate(req.user.id, newData, {
        new: true,
        runValidators: true,
    })

    res.status(200).json({
        success: true,
        message: "updated user successfully",
        user
    })
})

exports.adminAllUser = BigPromise(async (req, res, next) => {
    const users = await User.find()

    res.status(200).json({
        success: true,
        users,
    })
})

exports.managerAllUser = BigPromise(async (req, res, next) => {
    const users = await User.find({ role: "user" })
    res.status(200).json({
        success: true,
        users,
    })
})

exports.adminGetSingleUser = BigPromise(async (req, res, next) => {
    const user = await User.findById(req.params.id)

    if (!user) {
        next(new CustomError("User not found", 400))
    }


    res.status(200).json({
        success: true,
        user
    })
})

exports.adminUpdateUserDetails = BigPromise(async (req, res, next) => {

    const newData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    }

    const user = await User.findByIdAndUpdate(req.params.id, newData, {
        new: true,
        runValidators: true,
    })

    res.status(200).json({
        success: true,
        message: "Admin updated user successfully",
        user
    })
})

exports.adminDeleteOneUser = BigPromise(async (req, res, next) => {
    const user = await User.findById(req.params.id)

    if (!user) {
        return next(new CustomError("No user Found", 401))
    }

    const imageId = user.photo.id

    await cloudinary.uploader.destroy(imageId)

    await user.remove()

    res.status(200).json({
        success: true,
        message: "user Deleted"
    })

})