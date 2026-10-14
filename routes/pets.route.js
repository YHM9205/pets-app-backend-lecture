const Router = require("express");
const router = Router();
const Pet = require('../models/Pet')


// CREATE - POST /
router.post('/', async (req, res) => {
    try {
        const { name, age, breed } = req.body
        const createdPet = await Pet.create({ name, age, breed })
        res.status(201).json(createdPet)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error.message })
    }
})

// READ ALL - GET /
router.get('/', async (req, res) => {
    try {
        const pets = await Pet.find()
        res.json(pets)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error.message })
    }
})

// READ ONE - GET /:id
router.get('/:id', async (req, res) => {
    try {
        const pet = await Pet.findById(req.params.id)
        if (!pet) {
            return res.status(404).json({ message: 'Pet not found' })
        }
        res.json(pet)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error.message })
    }
})

// UPDATE - PUT /:id
router.put('/:id', async (req, res) => {
    try {
        const { name, age, breed } = req.body
        const updatedPet = await Pet.findByIdAndUpdate(
            req.params.id,
            { name, age, breed },
            { new: true }
        )
        if (!updatedPet) {
            return res.status(404).json({ message: 'Pet not found' })
        }
        res.json(updatedPet)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error.message })
    }
})

// DELETE - DELETE /:id
router.delete('/:id', async (req, res) => {
    try {
        const deletedPet = await Pet.findByIdAndDelete(req.params.id)
        if (!deletedPet) {
            return res.status(404).json({ message: 'Pet not found' })
        }
        res.json(deletedPet)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error.message })
    }
})

module.exports = router
