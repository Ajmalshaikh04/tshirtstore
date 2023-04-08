const express = require("express")
require("dotenv").config();
const app = express()
var morgan = require("morgan")
const cookieParser = require("cookie-parser")
const fileUpload = require("express-fileupload")


//for swagger documentation
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./swagger.yaml");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//regular middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

//cookies and file middleware
app.use(cookieParser())
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: "/temp/",
}))

//morgan middleware
app.use(morgan('tiny'))

//import all routes here
const home = require("./routes/home")
const user = require("./routes/userRoute");
const product = require("./routes/productRoute");
const payment = require("./routes/paymentRoute");


//router middleware
app.use("/api/v1", home)
app.use("/api/v1", user)
app.use("/api/v1", product)
app.use("/api/v1", payment)


//export app js
module.exports = app


