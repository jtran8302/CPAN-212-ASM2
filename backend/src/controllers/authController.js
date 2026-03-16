import bcrypt from 'bcrypt';
import { User } from '../models/User.js';

// POST /api/auth/register
export const register = async (req, res, next) => {
    try {
        const { fullName, email, password, role } = req.body;

        if (!fullName || !email || !password || !role) {
            return res.status(400).json({ error: 'Bad Request', message: 'fullName, email, password, and role are required' });
        }

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(409).json({ error: 'Conflict', message: 'Email already in use' });
        }

        // passwordHash field triggers the bcrypt pre-save hook in User model
        const user = new User({ fullName, email, passwordHash: password, role });
        await user.save();

        res.status(201).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt
        });

    } catch (error) {
        next(error);
    }
};

// POST /api/auth/login
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Bad Request', message: 'email and password are required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized', message: 'Invalid credentials' });
        }

        const match = await bcrypt.compare(password, user.passwordHash);
        if (!match) {
            return res.status(401).json({ error: 'Unauthorized', message: 'Invalid credentials' });
        }

        // store userId and role in session — this is what requireAuth checks
        req.session.userId = user._id;
        req.session.role = user.role;

        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role
        });

    } catch (error) {
        next(error);
    }
};

// POST /api/auth/logout
export const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Server error', message: 'Could not log out' });
        }
        res.clearCookie('connect.sid');
        res.status(200).json({ message: 'Logged out successfully' });
    });
};

// GET /api/auth/me
export const me = async (req, res, next) => {
    try {
        const user = await User.findById(req.session.userId).select('-passwordHash');
        if (!user) {
            return res.status(404).json({ error: 'Not Found', message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
};
