const mongoose = require("mongoose");

const petSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true,
        min: 0
    },
    breed: {
        type: String
    },

}, { timestamps: true })

const Pet = mongoose.model("Pet", petSchema)
module.exports = Pet