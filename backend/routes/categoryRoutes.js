const express = require("express");
const { body, param, validationResult } = require("express-validator");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const dishController = require("../controllers/dishController");

const router = express.Router();

const verifierErreurs = (req, res, next) => {
  const erreurs = validationResult(req);
  if (!erreurs.isEmpty()) {
    return res.status(400).json({ message: erreurs.array()[0].msg });
  }
  next();
};

router.get("/", dishController.getCategories);

router.post(
  "/",
  authMiddleware,
  roleMiddleware("restaurateur", "admin"),
  [
    body("nom").trim().notEmpty().withMessage("Le nom de la catégorie est obligatoire"),
    body("restaurant").isMongoId().withMessage("Identifiant restaurant invalide")
  ],
  verifierErreurs,
  dishController.createCategory
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("restaurateur", "admin"),
  [
    param("id").isMongoId().withMessage("Identifiant catégorie invalide"),
    body("nom").optional().trim().notEmpty().withMessage("Le nom de la catégorie est invalide")
  ],
  verifierErreurs,
  dishController.updateCategory
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("restaurateur", "admin"),
  param("id").isMongoId().withMessage("Identifiant catégorie invalide"),
  verifierErreurs,
  dishController.deleteCategory
);

module.exports = router;
