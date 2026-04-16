const jwt = require('jsonwebtoken');

// Verify if the user is logged in (has a valid token)
exports.verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1]; 
  
  if (!token) return res.status(401).json({ message: "Access Denied. No token provided." });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; 
    next(); 
  } catch (error) {
    res.status(400).json({ message: "Invalid Token" });
  }
};

// Verify if the user has the required role
exports.checkRole = (rolesArray) => {
  return (req, res, next) => {
    if (!rolesArray.includes(req.user.role)) {
      return res.status(403).json({ message: "Permission Denied. You do not have the right role." });
    }
    next();
  };
};