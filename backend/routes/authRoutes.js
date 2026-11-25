const express = require("express");
const { body, validationResult } = require("express-validator");
const authController = require("../controllers/authController");

const router = express.Router();

// Mot de passe fort : 8 caractères, majuscule, minuscule, chiffre et symbole.
const motDePasseFort = body("password")
  .isLength({ min: 8 })
  .withMessage("Le mot de passe doit contenir au moins 8 caractères")
  .matches(/[A-Z]/)
  .withMessage("Le mot de passe doit contenir une majuscule")
  .matches(/[a-z]/)
  .withMessage("Le mot de passe doit contenir une minuscule")
  .matches(/[0-9]/)
  .withMessage("Le mot de passe doit contenir un chiffre")
  .matches(/[^A-Za-z0-9]/)
  .withMessage("Le mot de passe doit contenir un caractère spécial");

const verifierErreurs = (req, res, next) => {
  const erreurs = validationResult(req);
  if (!erreurs.isEmpty()) {
    return res.status(400).json({ message: erreurs.array()[0].msg });
  }
  next();
};

router.post(
  "/register",
  [
    body("nom").trim().notEmpty().withMessage("Le nom est obligatoire"),
    body("prenom").trim().notEmpty().withMessage("Le prénom est obligatoire"),
    body("email")
      .trim()
      .isEmail()
      .withMessage("Adresse email invalide"),
    body("telephone").trim().notEmpty().withMessage("Le téléphone est obligatoire"),
    motDePasseFort,
    body("confirmation")
      .notEmpty()
      .withMessage("La confirmation du mot de passe est obligatoire")
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("La confirmation du mot de passe ne correspond pas");
        }
        return true;
      })
  ],
  verifierErreurs,
  authController.register
);

router.post(
  "/login",
  [
    body("email").trim().isEmail().withMessage("Adresse email invalide"),
    body("password").notEmpty().withMessage("Le mot de passe est obligatoire")
  ],
  verifierErreurs,
  authController.login
);

module.exports = router;
