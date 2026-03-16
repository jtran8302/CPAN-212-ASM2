import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        minlength: 2,
        maxlength: 50
    },
    description: {
        type: String,
        maxlength: 200,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});


export const Category = mongoose.model('Category', categorySchema);

