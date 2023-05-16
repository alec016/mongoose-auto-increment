import mongoose from 'mongoose'
import autoIncrement, { startAt, incrementBy } from '@alec016/mongoose-autoincrement'
const Schema = mongoose.Schema

type TUser = {
    _id: number,
    name: string
}

const userSchema = new Schema<TUser>({
    _id: Number,
    name: {
        type: String,
        required: true
    }
})

userSchema.plugin(autoIncrement.plugin, {
    model: 'User',
    field: '_id',
    startAt: startAt(1),
    incrementBy: incrementBy(1)
})

export const User = mongoose.model('User', userSchema)