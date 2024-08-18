const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  console.log("Token received:", token);

  if (!token) {
    return res.status(401).json({
      status: "failed",
      message: "No token provided, authorization denied",
    });
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
      console.error('Error during token verification:', err);
      return res.status(401).json({
        status: "failed",
        message: "Token is not valid",
      });
    }
    
    console.log('Decoded token:', decoded);
    req.user = decoded; 
    next(); 
  });
};

module.exports = verifyToken;
