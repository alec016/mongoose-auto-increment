const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const autoIncrement = require('@alec016/mongoose-autoincrement')
require('dotenv').config()
const app = express()
const port = process.env.PORT || 3000
const DB = process.env.DB || 'mongodb://localhost:27017/test'
app.use(express.json())
app.use(cors())

mongoose.connect(DB)

const connection = mongoose.connection
autoIncrement.initialize(connection)

const routes = require('./routes/routes.js')
app.use('/api', routes)

app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`)
})