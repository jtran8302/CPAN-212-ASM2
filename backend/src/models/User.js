import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({

    fullName: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 80
    },

    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
    },

    passwordHash: {
        type: String,
        required: true
    },

    role: {
        type: String,
        required: true,
        enum: ['resident', 'provider']
    },

    createdAt: {
        type: Date,
        default: Date.now
    }

});

// hash password before saving
// only runs when passwordHash field is modified
userSchema.pre('save', async function (next) {
    if (!this.isModified('passwordHash')) 
        return;
    this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
});

export const User = mongoose.model('User', userSchema);
