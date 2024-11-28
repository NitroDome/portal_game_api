function apiKeyMiddleware(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).json({ message: 'Forbidden: No or invalid API key provided' });
    }

    const token = authHeader.split(' ')[1];
    const expectedApiKey = process.env.PORTAL_API_KEY;

    if (token !== expectedApiKey) {
        return res.status(403).json({ message: 'Forbidden: Invalid API key' });
    }
    next();
}

module.exports = apiKeyMiddleware;
