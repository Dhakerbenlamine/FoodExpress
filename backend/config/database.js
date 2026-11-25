const mongoose = require("mongoose");

// Se connecte à MongoDB avant le démarrage complet du serveur.
const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connecté à la base foodexpress");
  } catch (error) {
    console.error("Connexion MongoDB impossible :", error.message);
    throw error;
  }
};

module.exports = connectDatabase;
