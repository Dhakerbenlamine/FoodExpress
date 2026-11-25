const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Vérifie le JWT et s'assure que le compte est toujours actif.
const authMiddleware = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentification requise" });
    }

    const token = authorization.split(" ")[1];
    let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ message: "Token invalide ou expiré" });
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "Utilisateur introuvable" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Compte désactivé" });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authMiddleware;
