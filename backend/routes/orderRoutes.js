const express = require("express");
const { body, param, validationResult } = require("express-validator");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const orderController = require("../controllers/orderController");

const router = express.Router();

const verifierErreurs = (req, res, next) => {
  const erreurs = validationResult(req);
  if (!erreurs.isEmpty()) {
    return res.status(400).json({ message: erreurs.array()[0].msg });
  }
  next();
};

router.post(
  "/",
  authMiddleware,
  roleMiddleware("client"),
  [
    body("restaurant").isMongoId().withMessage("Identifiant restaurant invalide"),
    body("adresseLivraison").trim().notEmpty().withMessage("L'adresse de livraison est obligatoire"),
    body("modePaiement").isIn(["livraison", "en_ligne"]).withMessage("Mode de paiement invalide"),
    body("articles").isArray({ min: 1 }).withMessage("La commande doit contenir au moins un article")
  ],
  verifierErreurs,
  orderController.createOrder
);

router.get("/my-orders", authMiddleware, roleMiddleware("client"), orderController.getMyOrders);

router.get(
  "/restaurant",
  authMiddleware,
  roleMiddleware("restaurateur", "admin"),
  orderController.getRestaurantOrders
);

router.put(
  "/:id/status",
  authMiddleware,
  roleMiddleware("restaurateur", "admin"),
  [
    param("id").isMongoId().withMessage("Identifiant commande invalide"),
    body("statut")
      .isIn(["acceptee", "en_preparation", "en_livraison", "livree", "annulee"])
      .withMessage("Statut invalide")
  ],
  verifierErreurs,
  orderController.updateOrderStatus
);

module.exports = router;
