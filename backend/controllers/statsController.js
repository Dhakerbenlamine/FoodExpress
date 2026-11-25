const Order = require("../models/Order");
const Restaurant = require("../models/Restaurant");
const User = require("../models/User");

exports.getAdminStats = async (req, res, next) => {
  try {
    const [nombreClients, nombreRestaurants, nombreCommandes, chiffreAffaires] =
      await Promise.all([
        User.countDocuments({ role: "client" }),
        Restaurant.countDocuments(),
        Order.countDocuments(),
        Order.aggregate([
          { $match: { statut: { $nin: ["annulee"] } } },
          { $group: { _id: null, total: { $sum: "$total" } } }
        ])
      ]);

    res.json({
      nombreClients,
      nombreRestaurants,
      nombreCommandes,
      chiffreAffairesGlobal: chiffreAffaires[0]?.total || 0
    });
  } catch (error) {
    next(error);
  }
};

exports.getRestaurantStats = async (req, res, next) => {
  try {
    const restaurants = await Restaurant.find(
      req.user.role === "admin" ? {} : { owner: req.user._id },
      "_id"
    );
    const restaurantIds = restaurants.map((restaurant) => restaurant._id);
    const filtre = { restaurant: { $in: restaurantIds } };

    const [totalCommandes, commandesEnAttente, commandesAcceptees, revenu] =
      await Promise.all([
        Order.countDocuments(filtre),
        Order.countDocuments({ ...filtre, statut: "en_attente" }),
        Order.countDocuments({ ...filtre, statut: "acceptee" }),
        Order.aggregate([
          { $match: { restaurant: { $in: restaurantIds }, statut: { $nin: ["annulee"] } } },
          { $group: { _id: null, total: { $sum: "$total" } } }
        ])
      ]);

    const platsLesPlusCommandes = await Order.aggregate([
      { $match: { restaurant: { $in: restaurantIds }, statut: { $ne: "annulee" } } },
      { $unwind: "$articles" },
      {
        $group: {
          _id: "$articles.plat",
          nom: { $first: "$articles.nom" },
          quantiteTotale: { $sum: "$articles.quantite" }
        }
      },
      { $sort: { quantiteTotale: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      totalCommandes,
      commandesEnAttente,
      commandesAcceptees,
      chiffreAffaires: revenu[0]?.total || 0,
      platsLesPlusCommandes
    });
  } catch (error) {
    next(error);
  }
};
