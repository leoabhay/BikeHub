const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
       
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id; 
        next();
    } catch (error) {
        res.status(400).json({ message: 'Invalid token.' });
    }
};
const isAuthenticated = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
  
    if (token) {
    
      return res.redirect('/');
    }
    next();
  };

  module.exports = { authMiddleware, isAuthenticated };