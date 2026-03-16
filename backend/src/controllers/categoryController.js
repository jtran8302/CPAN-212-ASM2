import { Category } from '../models/Category.js';

export const getAllCategories = async (req, res, next) => {
    try {
        const categories = await Category.find().sort({ name: 1 });
        res.status(200).json(categories);
    } catch (err) {
        next(err);
    }
};

export const createCategory = async (req, res, next) => {
    try {
        const { name, description } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Bad Request', message: 'Category name is required' });
        }

        const existing = await Category.findOne({ name: name.trim().toLowerCase() });
        if (existing) {
            return res.status(409).json({ error: 'Conflict', message: 'Category already exists' });
        }

        const category = new Category({ name: name.trim(), description: description?.trim() || null });
        await category.save();
        res.status(201).json(category);
    } catch (err) {
        next(err);
    }
};

