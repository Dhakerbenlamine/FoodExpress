const express = require("express");
const { body, param, validationResult } = require("express-validator");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const imageUploadMiddleware = require("../middleware/imageUploadMiddleware");
const dishController = require("../controllers/dishController");

const router = express.Router();

const verifierErreurs = (req, res, next) => {
  const erreurs = validationResult(req);
  if (!erreurs.isEmpty()) {
    return res.status(400).json({ message: erreurs.array()[0].msg });
  }
  next();
};

router.get("/", dishController.getDishes);

router.post(
  "/",
  authMiddleware,
  roleMiddleware("restaurateur", "admin"),
  imageUploadMiddleware,
  [
    body("nom").trim().notEmpty().withMessage("Le nom du plat est obligatoire"),
    body("prix").isFloat({ min: 0 }).withMessage("Le prix est invalide"),
    body("categorie").isMongoId().withMessage("Identifiant catégorie invalide"),
    body("restaurant").isMongoId().withMessage("Identifiant restaurant invalide"),
    body("disponible").optional().isBoolean().withMessage("Disponible doit être booléen")
  ],
  verifierErreurs,
  dishController.createDish
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("restaurateur", "admin"),
  imageUploadMiddleware,
  [
    param("id").isMongoId().withMessage("Identifiant plat invalide"),
    body("prix").optional().isFloat({ min: 0 }).withMessage("Le prix est invalide"),
    body("categorie").optional().isMongoId().withMessage("Identifiant catégorie invalide"),
    body("disponible").optional().isBoolean().withMessage("Disponible doit être booléen")
  ],
  verifierErreurs,
  dishController.updateDish
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("restaurateur", "admin"),
  param("id").isMongoId().withMessage("Identifiant plat invalide"),
  verifierErreurs,
  dishController.deleteDish
);

module.exports = router;
