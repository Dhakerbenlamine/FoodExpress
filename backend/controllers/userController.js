const User = require("../models/User");

// Retourne le profil de l'utilisateur connecté.
exports.getProfile = async (req, res, next) => {
  try {
    return res.json({
      id: req.user._id,
      nom: req.user.nom,
      prenom: req.user.prenom,
      email: req.user.email,
      telephone: req.user.telephone,
      role: req.user.role,
      isActive: req.user.isActive
    });
  } catch (error) {
    next(error);
  }
};

// Modifie uniquement les champs autorisés du profil.
exports.updateProfile = async (req, res, next) => {
  try {
    const { nom, prenom, telephone } = req.body;

    req.user.nom = nom;
    req.user.prenom = prenom;
    req.user.telephone = telephone;
    await req.user.save();

    return res.json({
      message: "Profil mis à jour",
      user: {
        id: req.user._id,
        nom: req.user.nom,
        prenom: req.user.prenom,
        email: req.user.email,
        telephone: req.user.telephone,
        role: req.user.role,
        isActive: req.user.isActive
      }
    });
  } catch (error) {
    next(error);
  }
};

// Change le mot de passe après vérification de l'ancien.
exports.updatePassword = async (req, res, next) => {
  try {
    const { ancienMotDePasse, nouveauMotDePasse, confirmationMotDePasse } = req.body;
    const user = await User.findById(req.user._id).select("+password");

    const motDePasseValide = await user.comparePassword(ancienMotDePasse);
    if (!motDePasseValide) {
      return res.status(400).json({ message: "Ancien mot de passe incorrect" });
    }

    user.password = nouveauMotDePasse;
    await user.save();

    return res.json({ message: "Mot de passe modifié avec succès" });
  } catch (error) {
    next(error);
  }
};

// Liste les utilisateurs avec recherche par nom, prénom ou email.
exports.getUsers = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
    const search = (req.query.search || "").trim();
    const filtre = search
      ? {
          $or: [
            { nom: { $regex: search, $options: "i" } },
            { prenom: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } }
          ]
        }
      : {};

    const [users, total] = await Promise.all([
      User.find(filtre)
        .select("-password")
        .sort({ nom: 1, prenom: 1 })
        .skip((page - 1) * limit)
        .limit(limit),
      User.countDocuments(filtre)
    ]);

    return res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Active ou désactive un compte utilisateur.
exports.toggleUserActive = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    user.isActive = !user.isActive;
    await user.save();

    return res.json({
      message: user.isActive ? "Utilisateur activé" : "Utilisateur désactivé",
      user: {
        id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        telephone: user.telephone,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    next(error);
  }
};
