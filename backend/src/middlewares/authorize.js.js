// middleware/authorize.js
const authorizeRoles = (...roles) => (req, res, next) => {
    const userRole = req.user.roles[0]; // Assuming roles is an array and you are using the first role for checking
  
    if (!roles.includes(userRole)) {
      return res.status(403).json({ status: "failed", message: "Access denied" });
    }
  
    next();
  };
  
  module.exports = authorizeRoles;
  