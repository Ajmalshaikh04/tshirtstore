const { geoSearch } = require("../models/productModel");

class WhereClause {
    constructor(base, bigQ) {
        this.base = base;
        this.bigQ = bigQ;
    }
    search() {
        const searchWord = this.bigQ.search ? {
            name: {
                $regex: this.bigQ.search,
                $options: "i"
            }
        } : {}

        this.base = this.base.find({ ...searchWord })
        return this
    }

    filter() {
        const copyQ = { ...this.bigQ }

        delete copyQ["search"];
        delete copyQ["limit"];
        delete copyQ["page"];

        //convert bigQ into a string=> copyQ

        let stringOfCopyQ = JSON.stringify(copyQ)

        stringOfCopyQ = stringOfCopyQ.replace(/\b(gte|lte|gt|lt)\b/g, m => `$${m}`)

        const jsonOfCopyQ = JSON.parse(stringOfCopyQ)

        this.base = this.base.find(jsonOfCopyQ)
    }

    pagination(resPerPage) {
        let currentPage = 1;
        if (this.bigQ.page) {
            currentPage = this.bigQ.page
        }

        const skipVal = resPerPage * (currentPage - 1)

        this.base = this.base.limit(resPerPage).skip(skipVal)
        return this;
    }
}

module.exports = WhereClause
//bookit features

// class APIFeatures {
//     constructor(query, queryStr) {
//         this.query = query;
//         this.queryStr = queryStr;
//     }

//     search() {
//         const location = this.queryStr.location ? {
//             address: {
//                 $regex: this.queryStr.location,
//                 $options: "i"
//             }
//         } : {}
//         // console.log(location);
//         this.query = this.query.find({ ...location })
//         return this
//     }

//     filter() {
//         const queryCopy = { ...this.queryStr }

//         console.log(queryCopy);

//         //Remove fields from query
//         const removeFields = ["location", "page"]
//         removeFields.forEach(el => delete queryCopy[el]);
//         console.log(queryCopy);


//         this.query = this.query.find(queryCopy);
//         return this;
//     }

//     pagination(resPerPage) {
//         const currentPage = Number(this.queryStr.page) || 1;
//         const skip = resPerPage * (currentPage - 1)

//         this.query = this.query.limit(resPerPage).skip(skip)
//         return this;
//     }
// }
// export default APIFeatures; 