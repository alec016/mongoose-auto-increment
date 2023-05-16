/* const express = require('express') */
import e from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import autoIncrement from '@alec016/mongoose-autoincrement'
const express = e
require('dotenv').config()
const app = express()
const port = process.env.PORT || 3000
const DB = process.env.DB || 'mongodb://localhost:27017/test'
app.use(express.json())
app.use(cors())

mongoose.connect(DB)

const connection = mongoose.connection
autoIncrement.initialize(connection)

import router from './routes/routes'
app.use('/api', router)

app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`)
})