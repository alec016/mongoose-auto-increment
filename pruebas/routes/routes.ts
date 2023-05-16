import { User } from '../models/User'
import { Router } from 'express'
const router = Router()

router.get('/user', async (req, res) => {
    res.status(200).json(await User.find())
})

router.post('/user', async (req, res) => {
    const user = new User({
        name: req.body.name
    })
    await user.save()
    res.status(200).json(user)
})

router.get('/user/:id', async (req, res) => {
    res.status(200).json(await User.findById(req.params.id))
})

export default router