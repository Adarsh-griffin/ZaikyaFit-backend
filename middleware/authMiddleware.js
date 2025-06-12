const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // 1. Check for token in cookies or Authorization header
  token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

  // 2. If no token, proceed as guest (don't block request)
  if (!token) {
    req.user = null; // Explicitly set user to null for guest sessions
    return next();
  }

  try {
    // 3. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey');
    
    // 4. Get user from database
    req.user = await User.findById(decoded.userId).select('-password');
    
    if (!req.user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // 5. Attach user to request and proceed
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    
    // 6. Handle different error cases
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired, please login again' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    return res.status(401).json({ error: 'Not authorized' });
  }
};

// Optional: Admin role middleware
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Not authorized as admin' });
  }
};

module.exports = { protect, admin };