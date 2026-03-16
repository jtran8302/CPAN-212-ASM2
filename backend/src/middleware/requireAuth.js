// requireAuth middleware
// checks that the request has an active session
// if not, returns 401 before the request reaches the controller
// attach this to any route that requires login

export const requireAuth = (req, res, next) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: 'Unauthorized', message: 'Login required' });
    }
    next();
};
