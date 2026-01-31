const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.cookies?.token || req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        if (req.xhr || req.headers.accept?.includes('application/json')) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }
        return res.redirect('/login');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Contains id
        res.locals.user = decoded;
        next();
    } catch (error) {
        if (req.xhr || req.headers.accept?.includes('application/json')) {
            return res.status(400).json({ message: 'Invalid token.' });
        }
        res.clearCookie('token');
        res.redirect('/login');
    }
};

const isAuthenticated = (req, res, next) => {
    const token = req.cookies?.token || req.header('Authorization')?.replace('Bearer ', '');
  
    if (token) {
        try {
            jwt.verify(token, process.env.JWT_SECRET);
            return res.redirect('/');
        } catch (error) {
            // Invalid token, proceed to login
        }
    }
    next();
};

module.exports = { authMiddleware, isAuthenticated };