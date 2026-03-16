import mongoose from 'mongoose';
import { ENUMS } from '../config/enums.js';

const quoteSchema = new mongoose.Schema({

    requestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ServiceRequest',
        required: true
    },

    providerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    price: {
        type: Number,
        required: true,
        min: 1
    },

    message: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 500
    },

    daysToComplete: {
        type: Number,
        required: true,
        min: 1,
        max: 30
    },

    status: {
        type: String,
        enum: ENUMS.QUOTE_STATUSES,
        default: 'pending'
    }

}, {
    timestamps: true
});

quoteSchema.index({ requestId: 1 });
quoteSchema.index({ requestId: 1, providerId: 1 }, { unique: true });

export const Quote = mongoose.model('Quote', quoteSchema);
