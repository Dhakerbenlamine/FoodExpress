require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDatabase = require("./config/database");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const restaurantRoutes = require("./routes/restaurantRoutes");
const dishRoutes = require("./routes/dishRoutes");
const orderRoutes = require("./routes/orderRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const statsController = require("./controllers/statsController");
const authMiddleware = require("./middleware/authMiddleware");
const roleMiddleware = require("./middleware/roleMiddleware");
const restaurantController = require("./controllers/restaurantController");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: [
      "http://localhost:4200",
      "http://127.0.0.1:4200",
      process.env.CORS_ORIGIN
    ].filter(Boolean)
  })
);
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads"), { maxAge: "1d" }));

app.get("/api/health", (req, res) => {
  res.json({ message: "FoodExpress API opérationnelle" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/dishes", dishRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/categories", categoryRoutes);
app.get(
  "/api/admin/restaurants",
  authMiddleware,
  roleMiddleware("admin"),
  restaurantController.getAdminRestaurants
);
app.get(
  "/api/admin/stats",
  authMiddleware,
  roleMiddleware("admin"),
  statsController.getAdminStats
);
app.get(
  "/api/restaurant-stats",
  authMiddleware,
  roleMiddleware("restaurateur", "admin"),
  statsController.getRestaurantStats
);

// Route inconnue : réponse JSON cohérente avec le reste de l'API.
app.use((req, res) => {
  res.status(404).json({ message: "Route introuvable" });
});

// Gestionnaire global des erreurs Mongoose, JWT et serveur.
app.use((error, req, res, next) => {
  if (error && error.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Corps JSON invalide" });
  }

  if (error && error.code === 11000) {
    return res.status(409).json({ message: "Cette adresse email est déjà utilisée" });
  }

  if (error && error.name === "ValidationError") {
    return res.status(400).json({
      message: Object.values(error.errors)[0].message
    });
  }

  console.error(error);
  return res.status(500).json({ message: "Erreur interne du serveur" });
});

const startServer = async () => {
  await connectDatabase();
  app.listen(PORT, () => {
    console.log(`Serveur FoodExpress démarré sur http://localhost:${PORT}`);
  });
};

startServer().catch((error) => {
  console.error("Impossible de démarrer le serveur :", error.message);
  process.exit(1);
});
