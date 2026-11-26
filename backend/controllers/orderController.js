const mongoose = require("mongoose");
const Order = require("../models/Order");
const Dish = require("../models/Dish");
const Restaurant = require("../models/Restaurant");

const transitions = {
  en_attente: ["acceptee", "annulee"],
  acceptee: ["en_preparation", "annulee"],
  en_preparation: ["en_livraison"],
  en_livraison: ["livree"],
  livree: [],
  annulee: []
};

exports.createOrder = async (req, res, next) => {
  try {
    const { restaurant, articles, adresseLivraison, modePaiement, remarque } = req.body;

    if (!mongoose.isValidObjectId(restaurant)) {
      return res.status(400).json({ message: "Identifiant restaurant invalide" });
    }
    if (!Array.isArray(articles) || articles.length === 0) {
      return res.status(400).json({ message: "La commande doit contenir au moins un article" });
    }

    const restaurantDocument = await Restaurant.findById(restaurant);
    if (!restaurantDocument) {
      return res.status(404).json({ message: "Restaurant introuvable" });
    }
    if (!restaurantDocument.isOpen) {
      return res.status(400).json({ message: "Le restaurant est fermé" });
    }
    if (restaurantDocument.statutValidation !== "validee") {
      return res.status(400).json({ message: "Le restaurant est suspendu" });
    }

    const platIds = [];
    articles.forEach((article) => {
      if (!mongoose.isValidObjectId(article.plat)) {
        throw Object.assign(new Error("Identifiant plat invalide"), { statusCode: 400 });
      }
      if (!Number.isInteger(article.quantite) || article.quantite < 1) {
        throw Object.assign(new Error("La quantité doit être supérieure ou égale à 1"), { statusCode: 400 });
      }
      platIds.push(article.plat);
    });

    const plats = await Dish.find({ _id: { $in: platIds } });
    const platsParId = new Map(plats.map((plat) => [plat._id.toString(), plat]));
    const articlesCopies = [];
    let sousTotal = 0;

    for (const article of articles) {
      const plat = platsParId.get(article.plat);
      if (!plat) {
        return res.status(404).json({ message: "Plat introuvable" });
      }
      if (!plat.disponible) {
        return res.status(400).json({ message: `Le plat "${plat.nom}" est indisponible` });
      }
      if (plat.restaurant.toString() !== restaurantDocument._id.toString()) {
        return res.status(400).json({ message: "Tous les plats doivent appartenir au même restaurant" });
      }

      const ligneSousTotal = plat.prix * article.quantite;
      sousTotal += ligneSousTotal;
      articlesCopies.push({
        plat: plat._id,
        nom: plat.nom,
        quantite: article.quantite,
        prixUnitaire: plat.prix
      });
    }

    const fraisLivraison = restaurantDocument.fraisLivraison;
    const order = await Order.create({
      client: req.user._id,
      restaurant: restaurantDocument._id,
      articles: articlesCopies,
      adresseLivraison,
      sousTotal,
      fraisLivraison,
      total: sousTotal + fraisLivraison,
      modePaiement,
      statut: "en_attente",
      remarque: remarque || ""
    });

    res.status(201).json(order);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

exports.getMyOrders = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
    const filtre = { client: req.user._id };
    const [orders, total] = await Promise.all([
      Order.find(filtre)
        .populate("restaurant", "nom adresse fraisLivraison image")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Order.countDocuments(filtre)
    ]);
    res.json({
      orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    next(error);
  }
};

exports.getRestaurantOrders = async (req, res, next) => {
  try {
    const restaurants = await Restaurant.find(
      req.user.role === "admin" ? {} : { owner: req.user._id },
      "_id"
    );
    const restaurantIds = restaurants.map((restaurant) => restaurant._id);

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
    const filtre = { restaurant: { $in: restaurantIds } };
    const [orders, total] = await Promise.all([
      Order.find(filtre)
        .populate("client", "nom prenom email telephone")
        .populate("restaurant", "nom")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Order.countDocuments(filtre)
    ]);
    res.json({
      orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    next(error);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate("restaurant");
    if (!order) {
      return res.status(404).json({ message: "Commande introuvable" });
    }

    if (
      req.user.role !== "admin" &&
      order.restaurant.owner.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Cette commande appartient à un autre restaurant" });
    }

    if (["livree", "annulee"].includes(order.statut)) {
      return res.status(400).json({ message: "Une commande livrée ou annulée est finale" });
    }

    const nouveauStatut = req.body.statut;
    if (!transitions[order.statut].includes(nouveauStatut)) {
      return res.status(400).json({
        message: `Transition invalide : ${order.statut} -> ${nouveauStatut}`
      });
    }

    order.statut = nouveauStatut;
    await order.save();
    res.json(order);
  } catch (error) {
    next(error);
  }
};
