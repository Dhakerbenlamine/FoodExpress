const express = require("express");
const { body, param, validationResult } = require("express-validator");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const userController = require("../controllers/userController");

const router = express.Router();

const verifierErreurs = (req, res, next) => {
  const erreurs = validationResult(req);
  if (!erreurs.isEmpty()) {
    return res.status(400).json({ message: erreurs.array()[0].msg });
  }
  next();
};

const motDePasseFort = body("nouveauMotDePasse")
  .isLength({ min: 8 })
  .withMessage("Le nouveau mot de passe doit contenir au moins 8 caractères")
  .matches(/[A-Z]/)
  .withMessage("Le nouveau mot de passe doit contenir une majuscule")
  .matches(/[a-z]/)
  .withMessage("Le nouveau mot de passe doit contenir une minuscule")
  .matches(/[0-9]/)
  .withMessage("Le nouveau mot de passe doit contenir un chiffre")
  .matches(/[^A-Za-z0-9]/)
  .withMessage("Le nouveau mot de passe doit contenir un caractère spécial");

router.get("/profile", authMiddleware, userController.getProfile);

router.put(
  "/profile",
  authMiddleware,
  [
    body("nom").trim().notEmpty().withMessage("Le nom est obligatoire"),
    body("prenom").trim().notEmpty().withMessage("Le prénom est obligatoire"),
    body("telephone").trim().notEmpty().withMessage("Le téléphone est obligatoire")
  ],
  verifierErreurs,
  userController.updateProfile
);

router.put(
  "/password",
  authMiddleware,
  [
    body("ancienMotDePasse")
      .notEmpty()
      .withMessage("L'ancien mot de passe est obligatoire"),
    motDePasseFort,
    body("confirmationMotDePasse")
      .notEmpty()
      .withMessage("La confirmation du nouveau mot de passe est obligatoire")
      .custom((value, { req }) => {
        if (value !== req.body.nouveauMotDePasse) {
          throw new Error("La confirmation du mot de passe ne correspond pas");
        }
        return true;
      })
  ],
  verifierErreurs,
  userController.updatePassword
);

router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  userController.getUsers
);

router.put(
  "/:id/toggle-active",
  authMiddleware,
  roleMiddleware("admin"),
  param("id").isMongoId().withMessage("Identifiant utilisateur invalide"),
  verifierErreurs,
  userController.toggleUserActive
);

module.exports = router;
