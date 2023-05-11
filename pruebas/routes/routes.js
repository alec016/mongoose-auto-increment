const User = require('../models/User')
const router = require('express').Router()

router.get('/user', async (req, res) => {
    res.status(200).json(await User.find())
})

router.post('/user', async (req, res) => {
    const user = new User({
        name: req.body.name
    })
    res.status(200).json(await user.save())
})

router.get('/user/:id', async (req, res) => {
    res.status(200).json(await User.findById(req.params.id))
})

module.exports = router