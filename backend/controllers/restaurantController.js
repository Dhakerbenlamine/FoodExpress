const Restaurant = require("../models/Restaurant");
const Category = require("../models/Category");
const Dish = require("../models/Dish");
const Order = require("../models/Order");
const mongoose = require("mongoose");
const { saveImage } = require("../utils/imageStorage");

exports.getRestaurants = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
    const filtre = { statutValidation: "validee" };

    if (req.query.nom) {
      filtre.nom = { $regex: req.query.nom.trim(), $options: "i" };
    }
    if (req.query.typeCuisine) {
      filtre.typeCuisine = { $regex: req.query.typeCuisine.trim(), $options: "i" };
    }
    if (req.query.isOpen !== undefined) {
      if (!["true", "false"].includes(req.query.isOpen)) {
        return res.status(400).json({ message: "isOpen doit être true ou false" });
      }
      filtre.isOpen = req.query.isOpen === "true";
    }

    const [restaurants, total] = await Promise.all([
      Restaurant.find(filtre)
        .populate("owner", "nom prenom email")
        .sort({ nom: 1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Restaurant.countDocuments(filtre)
    ]);

    res.json({
      restaurants,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    next(error);
  }
};

exports.getAdminRestaurants = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
    const filtre = {};
    if (req.query.statutValidation) {
      filtre.statutValidation = req.query.statutValidation;
    }
    const [restaurants, total] = await Promise.all([
      Restaurant.find(filtre)
        .populate("owner", "nom prenom email")
        .sort({ nom: 1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Restaurant.countDocuments(filtre)
    ]);
    res.json({
      restaurants,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    next(error);
  }
};

exports.getRestaurantById = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Identifiant restaurant invalide" });
    }
    const restaurant = await Restaurant.findById(req.params.id).populate(
      "owner",
      "nom prenom email"
    );
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant introuvable" });
    }
    if (
      restaurant.statutValidation === "suspendue" &&
      (!req.user || (req.user.role !== "admin" &&
        restaurant.owner._id.toString() !== req.user._id.toString()))
    ) {
      return res.status(404).json({ message: "Restaurant introuvable" });
    }
    res.json(restaurant);
  } catch (error) {
    next(error);
  }
};

exports.createRestaurant = async (req, res, next) => {
  try {
    const owner = req.user.role === "admin" && req.body.owner
      ? req.body.owner
      : req.user._id;

    if (!mongoose.isValidObjectId(owner)) {
      return res.status(400).json({ message: "Identifiant propriétaire invalide" });
    }

    const restaurant = await Restaurant.create({
      nom: req.body.nom,
      description: req.body.description,
      adresse: req.body.adresse,
      typeCuisine: req.body.typeCuisine,
      image: req.file ? await saveImage(req.file) : req.body.image,
      fraisLivraison: req.body.fraisLivraison,
      horaires: req.body.horaires,
      isOpen: req.body.isOpen,
      statutValidation: req.body.statutValidation || "validee",
      owner
    });

    res.status(201).json(restaurant);
  } catch (error) {
    next(error);
  }
};

const verifierProprietaire = (restaurant, user) =>
  user.role === "admin" ||
  restaurant.owner.toString() === user._id.toString();

exports.updateRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant introuvable" });
    }
    if (!verifierProprietaire(restaurant, req.user)) {
      return res.status(403).json({ message: "Vous ne gérez pas ce restaurant" });
    }

    const champsAutorises = [
      "nom",
      "description",
      "adresse",
      "typeCuisine",
      "image",
      "fraisLivraison",
      "horaires",
      "isOpen"
    ];
    champsAutorises.forEach((champ) => {
      if (req.body[champ] !== undefined) restaurant[champ] = req.body[champ];
    });
    if (req.file) {
      restaurant.image = await saveImage(req.file);
    }

    if (req.user.role === "admin" && req.body.statutValidation !== undefined) {
      restaurant.statutValidation = req.body.statutValidation;
    }
    await restaurant.save();
    res.json(restaurant);
  } catch (error) {
    next(error);
  }
};

exports.deleteRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant introuvable" });
    }
    if (!verifierProprietaire(restaurant, req.user)) {
      return res.status(403).json({ message: "Vous ne gérez pas ce restaurant" });
    }

    await Promise.all([
      Dish.deleteMany({ restaurant: restaurant._id }),
      Category.deleteMany({ restaurant: restaurant._id }),
      Order.deleteMany({ restaurant: restaurant._id }),
      Restaurant.deleteOne({ _id: restaurant._id })
    ]);
    res.json({ message: "Restaurant supprimé" });
  } catch (error) {
    next(error);
  }
};

exports.validateOrSuspendRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant introuvable" });
    }
    if (!["validee", "suspendue"].includes(req.body.statutValidation)) {
      return res.status(400).json({ message: "statutValidation invalide" });
    }
    restaurant.statutValidation = req.body.statutValidation;
    await restaurant.save();
    res.json(restaurant);
  } catch (error) {
    next(error);
  }
};
