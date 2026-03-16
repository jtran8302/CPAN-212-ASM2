import mongoose from 'mongoose';
import { ServiceRequest } from '../models/ServiceRequest.js';
import { Category } from '../models/Category.js';
import { ENUMS } from '../config/enums.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const allowedStatusTransitions = {
    open: ['cancelled'],
    quoted: ['cancelled'],
    assigned: ['completed']
};

export const createRequest = async (req, res, next) => {
    try {
        const { title, description, categoryId, location } = req.body;

        if (!title || !description || !categoryId || !location) {
            return res.status(400).json({ error: 'Bad Request', message: 'title, description, categoryId, and location are required' });
        }

        if (!isValidObjectId(categoryId)) {
            return res.status(400).json({ error: 'Bad Request', message: 'Invalid categoryId' });
        }

        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(400).json({ error: 'Bad Request', message: 'Category not found' });
        }

        const request = new ServiceRequest({
            title: title.trim(),
            description: description.trim(),
            categoryId,
            location: location.trim(),
            createdBy: req.session.userId
        });

        await request.save();

        return res.status(201).json(request);
    } catch (error) {
        next(error);
    }
};

export const getAllRequests = async (req, res, next) => {
    try {
        const { status, categoryId, q } = req.query;
        const filter = {};

        if (status) {
            if (!ENUMS.REQUEST_STATUSES.includes(status)) {
                return res.status(400).json({ error: 'Bad Request', message: 'Invalid status filter' });
            }
            filter.status = status;
        }

        if (categoryId) {
            if (!isValidObjectId(categoryId)) {
                return res.status(400).json({ error: 'Bad Request', message: 'Invalid categoryId filter' });
            }
            filter.categoryId = categoryId;
        }

        if (q) {
            filter.$text = { $search: q.toString() };
        }

        const requests = await ServiceRequest.find(filter)
            .sort({ createdAt: -1 })
            .populate('categoryId', 'name description')
            .populate('createdBy', 'fullName email role');

        return res.status(200).json(requests);
    } catch (error) {
        next(error);
    }
};

export const getRequestById = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ error: 'Bad Request', message: 'Invalid request ID' });
        }

        const request = await ServiceRequest.findById(id)
            .populate('categoryId', 'name description')
            .populate('createdBy', 'fullName email role');

        if (!request) {
            return res.status(404).json({ error: 'Not Found', message: 'Service request not found' });
        }

        return res.status(200).json(request);
    } catch (error) {
        next(error);
    }
};

export const updateRequestStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ error: 'Bad Request', message: 'Invalid request ID' });
        }

        if (!status || typeof status !== 'string' || !ENUMS.REQUEST_STATUSES.includes(status)) {
            return res.status(400).json({ error: 'Bad Request', message: 'Invalid status value' });
        }

        const request = await ServiceRequest.findById(id);
        if (!request) {
            return res.status(404).json({ error: 'Not Found', message: 'Service request not found' });
        }

        if (request.createdBy.toString() !== req.session.userId) {
            return res.status(403).json({ error: 'Forbidden', message: 'You are not the owner of this request' });
        }

        if (['completed', 'cancelled'].includes(request.status)) {
            return res.status(400).json({ error: 'Bad Request', message: 'Request is terminal and cannot be updated' });
        }

        const allowed = allowedStatusTransitions[request.status] || [];
        if (!allowed.includes(status)) {
            return res.status(400).json({ error: 'Bad Request', message: `Cannot transition from ${request.status} to ${status}` });
        }

        request.status = status;

        await request.save();

        return res.status(200).json(request);
    } catch (error) {
        next(error);
    }
};
