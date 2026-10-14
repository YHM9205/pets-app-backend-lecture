const mongoose = require('mongoose')

async function connectToDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log('Connected to Database')
    } catch (error) {
        console.log('Error connecting to DB:', error)
    }
}

module.exports = connectToDB
