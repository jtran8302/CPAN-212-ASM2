import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import { connectDB } from './config/db.js';
import { authRoutes } from './routes/authRoutes.js';
import { categoryRoutes } from './routes/categoryRoutes.js';
import { requestRoutes } from './routes/requestRoutes.js';
import { quoteRoutes } from './routes/quoteRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 5000;

// cors and session must come before routes
app.use(cors({ origin: process.env.CLIENT_ORIGIN, credentials: true }));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: { httpOnly: true, sameSite: 'lax', secure: false }
}));

app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/quotes', quoteRoutes);

app.use(errorHandler);

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('Failed to connect to database', err);
    process.exit(1);
});
