export const errorHandler = (err, req, res, next) => {
    const timestamp = new Date().toISOString();
    const path = req.path;

    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map((e) => e.message);
        return res.status(400).json({
            timestamp,
            path,
            status: 400,
            error: 'Bad Request',
            message: messages.join(', ')
        });
    }

    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(409).json({
            timestamp,
            path,
            status: 409,
            error: 'Conflict',
            message: `${field} already exists`
        });
    }

    if (err.name === 'CastError') {
        return res.status(400).json({
            timestamp,
            path,
            status: 400,
            error: 'Bad Request',
            message: 'Invalid ID format'
        });
    }

    const status = err.status || 500;
    const error = status === 500 ? 'Internal Server Error' : err.error || 'Error';
    const message = err.message || err.toString();

    res.status(status).json({
        timestamp,
        path,
        status,
        error,
        message
    });
};
