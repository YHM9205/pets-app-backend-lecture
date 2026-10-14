const express = require('express')
const app = express()
require('dotenv').config()
const cors = require('cors')
const morgan = require('morgan')
const mongoose = require('mongoose')
const connectToDB = require('./db')
const petsRoute = require('./routes/pets.route.js')

function checkIfValidId(req, res, next) {
    if (!mongoose.isObjectIdOrHexString(req.params.id)) {
        return res.status(400).json({ message: 'Invalid pet ID' })
    }
    next()
}

// Middleware
app.use(cors({ origin: 'http://localhost:5071' }))
app.use(express.json())
app.use(morgan('dev'))
app.use('/pets/:id', checkIfValidId)

// Routes
app.get('/', (req, res) => {
    res.send('Pets server is running 🐾')
})
app.use('/pets', petsRoute)

if (require.main === module) {
    connectToDB()
    app.listen(process.env.PORT, () => {
        console.log(`App is Running on port ${process.env.PORT}`)
    })
}

module.exports = { app, checkIfValidId }
