// requireRole middleware
// checks that the logged-in user has the required role
// always use requireAuth before this — requireRole assumes req.session.role exists
//
// usage:
//   router.post('/', requireAuth, requireRole('resident'), createRequest);
//   router.post('/', requireAuth, requireRole('provider'), submitQuote);

export const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.session.role)) {
            return res.status(403).json({ error: 'Forbidden', message: 'Insufficient role' });
        }
        next();
    };
};
