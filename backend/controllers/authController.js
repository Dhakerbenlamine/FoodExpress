const jwt = require("jsonwebtoken");
const User = require("../models/User");

const creerToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

const formatUser = (user) => ({
  id: user._id,
  nom: user.nom,
  prenom: user.prenom,
  email: user.email,
  telephone: user.telephone,
  role: user.role,
  isActive: user.isActive
});

// Crée un compte client : le rôle demandé par le visiteur est ignoré.
exports.register = async (req, res, next) => {
  try {
    const { nom, prenom, email, telephone, password } = req.body;

    const utilisateurExistant = await User.findOne({
      email: email.trim().toLowerCase()
    });

    if (utilisateurExistant) {
      return res.status(409).json({ message: "Cette adresse email est déjà utilisée" });
    }

    const user = await User.create({
      nom,
      prenom,
      email,
      telephone,
      password,
      role: "client",
      isActive: true
    });

    const token = creerToken(user);

    return res.status(201).json({
      message: "Compte créé avec succès",
      token,
      user: formatUser(user)
    });
  } catch (error) {
    next(error);
  }
};

// Authentifie un utilisateur actif et retourne son JWT.
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      email: email.trim().toLowerCase()
    }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Compte désactivé" });
    }

    const motDePasseValide = await user.comparePassword(password);
    if (!motDePasseValide) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect" });
    }

    const token = creerToken(user);

    return res.json({
      message: "Connexion réussie",
      token,
      user: formatUser(user)
    });
  } catch (error) {
    next(error);
  }
};
