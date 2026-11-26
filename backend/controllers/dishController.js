const mongoose = require("mongoose");
const Dish = require("../models/Dish");
const Category = require("../models/Category");
const Restaurant = require("../models/Restaurant");
const { saveImage } = require("../utils/imageStorage");

const estProprietaireRestaurant = (restaurant, user) =>
  user.role === "admin" ||
  restaurant.owner.toString() === user._id.toString();

exports.getDishes = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
    const filtre = {};

    if (req.query.restaurant) {
      if (!mongoose.isValidObjectId(req.query.restaurant)) {
        return res.status(400).json({ message: "Identifiant restaurant invalide" });
      }
      filtre.restaurant = req.query.restaurant;
    }
    if (req.query.categorie) {
      if (!mongoose.isValidObjectId(req.query.categorie)) {
        return res.status(400).json({ message: "Identifiant catégorie invalide" });
      }
      filtre.categorie = req.query.categorie;
    }

    const [dishes, total] = await Promise.all([
      Dish.find(filtre)
        .populate("categorie", "nom")
        .populate("restaurant", "nom")
        .sort({ nom: 1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Dish.countDocuments(filtre)
    ]);

    res.json({
      dishes,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    next(error);
  }
};

exports.createDish = async (req, res, next) => {
  try {
    const [restaurant, categorie] = await Promise.all([
      Restaurant.findById(req.body.restaurant),
      Category.findById(req.body.categorie)
    ]);

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant introuvable" });
    }
    if (!categorie) {
      return res.status(404).json({ message: "Catégorie introuvable" });
    }
    if (!estProprietaireRestaurant(restaurant, req.user)) {
      return res.status(403).json({ message: "Vous ne gérez pas ce restaurant" });
    }
    if (categorie.restaurant.toString() !== restaurant._id.toString()) {
      return res.status(400).json({ message: "La catégorie n'appartient pas à ce restaurant" });
    }

    const dish = await Dish.create({
      nom: req.body.nom,
      description: req.body.description,
      prix: req.body.prix,
      image: req.file ? await saveImage(req.file) : req.body.image,
      disponible: req.body.disponible,
      categorie: categorie._id,
      restaurant: restaurant._id
    });
    res.status(201).json(dish);
  } catch (error) {
    next(error);
  }
};

exports.updateDish = async (req, res, next) => {
  try {
    const dish = await Dish.findById(req.params.id);
    if (!dish) {
      return res.status(404).json({ message: "Plat introuvable" });
    }
    const restaurant = await Restaurant.findById(dish.restaurant);
    if (!estProprietaireRestaurant(restaurant, req.user)) {
      return res.status(403).json({ message: "Vous ne gérez pas ce restaurant" });
    }

    if (req.body.categorie !== undefined) {
      const categorie = await Category.findById(req.body.categorie);
      if (!categorie) {
        return res.status(404).json({ message: "Catégorie introuvable" });
      }
      if (categorie.restaurant.toString() !== dish.restaurant.toString()) {
        return res.status(400).json({ message: "La catégorie n'appartient pas à ce restaurant" });
      }
      dish.categorie = categorie._id;
    }

    ["nom", "description", "prix", "image", "disponible"].forEach((champ) => {
      if (req.body[champ] !== undefined) dish[champ] = req.body[champ];
    });
    if (req.file) {
      dish.image = await saveImage(req.file);
    }
    await dish.save();
    res.json(dish);
  } catch (error) {
    next(error);
  }
};

exports.deleteDish = async (req, res, next) => {
  try {
    const dish = await Dish.findById(req.params.id);
    if (!dish) {
      return res.status(404).json({ message: "Plat introuvable" });
    }
    const restaurant = await Restaurant.findById(dish.restaurant);
    if (!estProprietaireRestaurant(restaurant, req.user)) {
      return res.status(403).json({ message: "Vous ne gérez pas ce restaurant" });
    }
    await dish.deleteOne();
    res.json({ message: "Plat supprimé" });
  } catch (error) {
    next(error);
  }
};

exports.getCategories = async (req, res, next) => {
  try {
    const filtre = {};
    if (req.query.restaurant) {
      if (!mongoose.isValidObjectId(req.query.restaurant)) {
        return res.status(400).json({ message: "Identifiant restaurant invalide" });
      }
      filtre.restaurant = req.query.restaurant;
    }
    const categories = await Category.find(filtre).populate("restaurant", "nom").sort({ nom: 1 });
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.body.restaurant);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant introuvable" });
    }
    if (!estProprietaireRestaurant(restaurant, req.user)) {
      return res.status(403).json({ message: "Vous ne gérez pas ce restaurant" });
    }
    const categorie = await Category.create({
      nom: req.body.nom,
      description: req.body.description,
      restaurant: restaurant._id
    });
    res.status(201).json(categorie);
  } catch (error) {
    next(error);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const categorie = await Category.findById(req.params.id);
    if (!categorie) {
      return res.status(404).json({ message: "Catégorie introuvable" });
    }
    const restaurant = await Restaurant.findById(categorie.restaurant);
    if (!estProprietaireRestaurant(restaurant, req.user)) {
      return res.status(403).json({ message: "Vous ne gérez pas ce restaurant" });
    }
    if (req.body.nom !== undefined) categorie.nom = req.body.nom;
    if (req.body.description !== undefined) categorie.description = req.body.description;
    await categorie.save();
    res.json(categorie);
  } catch (error) {
    next(error);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const categorie = await Category.findById(req.params.id);
    if (!categorie) {
      return res.status(404).json({ message: "Catégorie introuvable" });
    }
    const restaurant = await Restaurant.findById(categorie.restaurant);
    if (!estProprietaireRestaurant(restaurant, req.user)) {
      return res.status(403).json({ message: "Vous ne gérez pas ce restaurant" });
    }
    await Dish.deleteMany({ categorie: categorie._id });
    await categorie.deleteOne();
    res.json({ message: "Catégorie supprimée" });
  } catch (error) {
    next(error);
  }
};
