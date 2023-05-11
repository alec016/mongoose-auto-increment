const mongoose = require('mongoose')
const autoIncrement = require('@alec016/mongoose-autoincrement')
const Schema = mongoose.Schema

const userSchema = new Schema({
    _id: Number,
    name: String
})

userSchema.plugin(autoIncrement.plugin, {
    model: 'User',
    field: '_id',
    startAt: 1,
    incrementBy: 1
})

module.exports = mongoose.model('User', userSchema)