import mongoose from 'mongoose';
import { Quote } from '../models/Quote.js';
import { ServiceRequest } from '../models/ServiceRequest.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// POST /api/requests/:id/quotes
export const submitQuote = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ error: 'Bad Request', message: 'Invalid request ID' });
        }

        const request = await ServiceRequest.findById(id);
        if (!request) {
            return res.status(404).json({ error: 'Not Found', message: 'Service request not found' });
        }

        if (!['open', 'quoted'].includes(request.status)) {
            return res.status(400).json({ error: 'Bad Request', message: 'Request is not open for quotes' });
        }

        const existing = await Quote.findOne({ requestId: id, providerId: req.session.userId });
        if (existing) {
            return res.status(409).json({ error: 'Conflict', message: 'You have already submitted a quote for this request' });
        }

        const { price, message, daysToComplete } = req.body;

        if (!price || !message || !daysToComplete) {
            return res.status(400).json({ error: 'Bad Request', message: 'price, message, and daysToComplete are required' });
        }

        const quote = new Quote({
            requestId: id,
            providerId: req.session.userId,
            price,
            message,
            daysToComplete
        });

        await quote.save();

        if (request.status === 'open') {
            request.status = 'quoted';
            await request.save();
        }

        return res.status(201).json(quote);
    } catch (error) {
        next(error);
    }
};

// GET /api/requests/:id/quotes
export const getQuotesForRequest = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ error: 'Bad Request', message: 'Invalid request ID' });
        }

        const request = await ServiceRequest.findById(id);
        if (!request) {
            return res.status(404).json({ error: 'Not Found', message: 'Service request not found' });
        }

        const filter = { requestId: id };

        if (req.session.role === 'resident') {
            if (request.createdBy.toString() !== req.session.userId) {
                return res.status(403).json({ error: 'Forbidden', message: 'You do not own this request' });
            }
        }

        if (req.session.role === 'provider') {
            filter.providerId = req.session.userId;
        }

        const quotes = await Quote.find(filter)
            .populate('providerId', 'fullName email')
            .sort({ createdAt: -1 });

        return res.status(200).json(quotes);
    } catch (error) {
        next(error);
    }
};

// PATCH /api/quotes/:id/accept
export const acceptQuote = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ error: 'Bad Request', message: 'Invalid quote ID' });
        }

        const quote = await Quote.findById(id);
        if (!quote) {
            return res.status(404).json({ error: 'Not Found', message: 'Quote not found' });
        }

        const request = await ServiceRequest.findById(quote.requestId);
        if (!request) {
            return res.status(404).json({ error: 'Not Found', message: 'Service request not found' });
        }

        if (request.createdBy.toString() !== req.session.userId) {
            return res.status(403).json({ error: 'Forbidden', message: 'You do not own this request' });
        }

        if (['completed', 'cancelled'].includes(request.status)) {
            return res.status(400).json({ error: 'Bad Request', message: 'Request is terminal and cannot be updated' });
        }

        if (quote.status !== 'pending') {
            return res.status(400).json({ error: 'Bad Request', message: 'Quote has already been decided' });
        }

        // three sequential updates — Option B from TDD
        quote.status = 'accepted';
        await quote.save();

        await Quote.updateMany(
            { requestId: request._id, _id: { $ne: quote._id } },
            { status: 'rejected' }
        );

        request.status = 'assigned';
        request.acceptedQuoteId = quote._id;
        await request.save();

        return res.status(200).json(quote);
    } catch (error) {
        next(error);
    }
};
