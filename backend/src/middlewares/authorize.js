// middleware/authorize.js
const authorizeRoles = (...roles) => (req, res, next) => {
    const userRole = req.user.roles[0]; 
  
    if (!roles.includes(userRole)) {
      return res.status(403).json({ status: "failed", message: "Access denied" });
    }
  
    next();
  };
  
  module.exports = authorizeRoles;
  