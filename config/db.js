const mongoose = require("mongoose")


const connectWithDb = () => {
    mongoose.connect(process.env.MONGO_URI)
        .then(console.log(`DB is connected`))
        .catch(error => {
            console.log(`DB Connection Issues`);
            console.log(error);
            process.exit(1)
        })
}

module.exports = connectWithDb