import mongoose from 'mongoose';
import { ENUMS } from '../config/enums.js';

const serviceRequestSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 80
    },
    description: {
        type: String,
        required: true,
        trim: true,
        minlength: 10,
        maxlength: 1000
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    location: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 80
    },
    status: {
        type: String,
        enum: ENUMS.REQUEST_STATUSES,
        default: 'open'
    },
    acceptedQuoteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quote',
        default: null
    }
}, {
    timestamps: true
});

serviceRequestSchema.index({ title: 'text', description: 'text' });
serviceRequestSchema.index({ status: 1, categoryId: 1 });

export const ServiceRequest = mongoose.model('ServiceRequest', serviceRequestSchema);
