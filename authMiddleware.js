const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - authentication middleware
const protect = async (req, res, next) => {
  let token;

  // Check if token exists in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Tenant isolation middleware
const tenantIsolation = async (req, res, next) => {
  try {
    // This middleware should be used after the protect middleware
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Add tenantId to req object for use in controllers
    req.tenantId = req.user.tenantId;
    
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { protect, tenantIsolation };
