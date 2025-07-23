

// const jwt = require("jsonwebtoken");
// require("dotenv").config();
// const redisClient = require("../services/redisservices.js");

// const authUser = async (req, res, next) => {
//   try {
//     // Extract token from cookies or authorization header
//     let token = req.cookies?.token;
//     if (!token && req.headers.authorization) {
//       const parts = req.headers.authorization.split(" ");
//       if (parts.length === 2 && parts[0] === "Bearer") {
//         token = parts[1];
//       }
//     }

//     if (!token) {
//       return res
//         .status(401)
//         .json({ error: "No token provided. Authorization denied." });
//     }

//     // Check if the token is blacklisted
//     const isBlackListed = await redisClient.get(token);
//     if (isBlackListed) {
//       res.clearCookie("token"); // Clear the cookie if the token is blacklisted
//       return res
//         .status(401)
//         .json({ error: "Unauthorized: Token is blacklisted." });
//     }

//     // Verify the token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded; // Attach the decoded user information to the request object
//     next();
//   } catch (error) {
//     console.error("Authentication Error:", error.message);

//     if (error.name === "TokenExpiredError") {
//       return res.status(401).json({ error: "Token has expired. Please log in again." });
//     }

//     res.status(401).json({ error: "Unauthorized: Invalid token." });
//   }
// };

// module.exports = authUser;


const jwt = require("jsonwebtoken");
require("dotenv").config();
// Redis removed
// const redisClient = require("../services/redisservices.js");

const authUser = async (req, res, next) => {
  try {
    // Extract token from cookies or authorization header
    let token = req.cookies?.token;
    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(" ");
      if (parts.length === 2 && parts[0] === "Bearer") {
        token = parts[1];
      }
    }

    if (!token) {
      return res
        .status(401)
        .json({ error: "No token provided. Authorization denied." });
    }

    // Redis blacklist check removed

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach the decoded user information to the request object
    next();
  } catch (error) {
    console.error("Authentication Error:", error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token has expired. Please log in again." });
    }

    res.status(401).json({ error: "Unauthorized: Invalid token." });
  }
};

module.exports = authUser;