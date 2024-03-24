import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true
    },

    password: {
        type: String,
    },
    phone: {
        type: String,
    },
    address: {
        type: {},
    },
    answer: {
        type: String,
    },
    role: {
        type: Number,
        default: 0
    }
}, { timestamps: true })

export default mongoose.model('users', userSchema);