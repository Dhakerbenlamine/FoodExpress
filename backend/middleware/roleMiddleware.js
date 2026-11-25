// Autorise uniquement les rôles indiqués pour une route.
const roleMiddleware = (...rolesAutorises) => {
  return (req, res, next) => {
    if (!req.user || !rolesAutorises.includes(req.user.role)) {
      return res.status(403).json({ message: "Accès refusé" });
    }
    next();
  };
};

module.exports = roleMiddleware;
