const jwt = require("jsonwebtoken");
const { User } = require("../models");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: "Token is not valid" });
    }

    req.user = user;
    req.userId = user._id.toString();
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ message: "Token is not valid" });
  }
};

/** Attach user if Bearer token is valid; continue as guest otherwise */
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return next();

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (user) {
      req.user = user;
      req.userId = user._id.toString();
    }
  } catch (error) {
    // ignore invalid/expired token for public routes
  }
  next();
};

const getAuth = (req) => {
  return {
    userId: req.userId,
    user: req.user,
  };
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as an admin" });
  }
};

module.exports = { auth, optionalAuth, getAuth, isAdmin, protect: auth, admin: isAdmin };
