const express = require("express")
const router = express.Router()

//controller
const { home } = require("../controllers/homeController")

router.route("/").get(home)


module.exports = router