const verifyRoles = (...allowedRoles) => {
    return (req, res, next) => {
      const userRoles = req.user.roles; 
      const hasRole = userRoles.some(role => allowedRoles.includes(role));
  
      if (!hasRole) {
        return res.status(403).json({ status: "failed", message: "Access denied" });
      }
      next();
    };
  };
  
  module.exports = verifyRoles;
  