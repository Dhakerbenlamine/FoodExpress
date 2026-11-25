const express = require("express");
const { body, param, validationResult } = require("express-validator");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const restaurantController = require("../controllers/restaurantController");

const router = express.Router();

const verifierErreurs = (req, res, next) => {
  const erreurs = validationResult(req);
  if (!erreurs.isEmpty()) {
    return res.status(400).json({ message: erreurs.array()[0].msg });
  }
  next();
};

router.get("/", restaurantController.getRestaurants);
router.get("/:id", restaurantController.getRestaurantById);

router.post(
  "/",
  authMiddleware,
  roleMiddleware("restaurateur", "admin"),
  [
    body("nom").trim().notEmpty().withMessage("Le nom est obligatoire"),
    body("adresse").trim().notEmpty().withMessage("L'adresse est obligatoire"),
    body("typeCuisine").trim().notEmpty().withMessage("Le type de cuisine est obligatoire"),
    body("horaires").trim().notEmpty().withMessage("Les horaires sont obligatoires"),
    body("fraisLivraison").isFloat({ min: 0 }).withMessage("Les frais de livraison sont invalides")
  ],
  verifierErreurs,
  restaurantController.createRestaurant
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("restaurateur", "admin"),
  [
    param("id").isMongoId().withMessage("Identifiant restaurant invalide"),
    body("fraisLivraison").optional().isFloat({ min: 0 }).withMessage("Les frais de livraison sont invalides"),
    body("statutValidation").optional().isIn(["validee", "suspendue"]).withMessage("statutValidation invalide")
  ],
  verifierErreurs,
  restaurantController.updateRestaurant
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("restaurateur", "admin"),
  param("id").isMongoId().withMessage("Identifiant restaurant invalide"),
  verifierErreurs,
  restaurantController.deleteRestaurant
);

router.put(
  "/:id/validation",
  authMiddleware,
  roleMiddleware("admin"),
  [
    param("id").isMongoId().withMessage("Identifiant restaurant invalide"),
    body("statutValidation").isIn(["validee", "suspendue"]).withMessage("statutValidation invalide")
  ],
  verifierErreurs,
  restaurantController.validateOrSuspendRestaurant
);

module.exports = router;
