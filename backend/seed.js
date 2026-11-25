require("dotenv").config();

const connectDatabase = require("./config/database");
const mongoose = require("mongoose");
const User = require("./models/User");
const Restaurant = require("./models/Restaurant");
const Category = require("./models/Category");
const Dish = require("./models/Dish");
const Order = require("./models/Order");

const seed = async () => {
  await connectDatabase();

  await Promise.all([
    Order.deleteMany({}),
    Dish.deleteMany({}),
    Category.deleteMany({}),
    Restaurant.deleteMany({}),
    User.deleteMany({})
  ]);

  const admin = await User.create({
    nom: "Admin",
    prenom: "FoodExpress",
    email: "admin@foodexpress.local",
    telephone: "20000000",
    password: "Admin123!",
    role: "admin",
    isActive: true
  });

  const restaurateur = await User.create({
    nom: "Ben Youssef",
    prenom: "Karim",
    email: "restaurateur@foodexpress.local",
    telephone: "22111111",
    password: "Restaurateur123!",
    role: "restaurateur",
    isActive: true
  });

  const client = await User.create({
    nom: "Ben Salah",
    prenom: "Sara",
    email: "client@foodexpress.local",
    telephone: "22222222",
    password: "Client123!",
    role: "client",
    isActive: true
  });

  const restaurants = await Restaurant.insertMany([
    {
      nom: "Pizza House",
      description: "Restaurant spécialisé en pizzas",
      adresse: "Centre-ville",
      typeCuisine: "Italienne",
      image: "pizza-house.jpg",
      fraisLivraison: 5,
      horaires: "10:00 - 23:00",
      isOpen: true,
      statutValidation: "validee",
      owner: restaurateur._id
    },
    {
      nom: "Tunis Food",
      description: "Spécialités tunisiennes traditionnelles",
      adresse: "Avenue de la République",
      typeCuisine: "Tunisien",
      image: "tunis-food.jpg",
      fraisLivraison: 4,
      horaires: "11:00 - 22:00",
      isOpen: true,
      statutValidation: "validee",
      owner: restaurateur._id
    }
  ]);

  const pizzaCategories = await Category.insertMany([
    { nom: "Pizzas", description: "Différents types de pizzas", restaurant: restaurants[0]._id },
    { nom: "Boissons", description: "Boissons fraîches", restaurant: restaurants[0]._id }
  ]);
  const tunisCategory = await Category.create({
    nom: "Plats principaux",
    description: "Plats tunisiens",
    restaurant: restaurants[1]._id
  });

  await Dish.insertMany([
    {
      nom: "Pizza Margherita",
      description: "Tomate, mozzarella et basilic",
      prix: 15,
      image: "pizza.jpg",
      disponible: true,
      categorie: pizzaCategories[0]._id,
      restaurant: restaurants[0]._id
    },
    {
      nom: "Pizza 4 fromages",
      description: "Quatre variétés de fromage",
      prix: 18,
      image: "4-fromages.jpg",
      disponible: true,
      categorie: pizzaCategories[0]._id,
      restaurant: restaurants[0]._id
    },
    {
      nom: "Coca-Cola",
      description: "Boisson gazeuse",
      prix: 3,
      image: "coca.jpg",
      disponible: true,
      categorie: pizzaCategories[1]._id,
      restaurant: restaurants[0]._id
    },
    {
      nom: "Plat tunisien",
      description: "Recette traditionnelle",
      prix: 12,
      image: "plat-tunisien.jpg",
      disponible: true,
      categorie: tunisCategory._id,
      restaurant: restaurants[1]._id
    }
  ]);

  console.log("Seed FoodExpress terminé");
  console.log({
    admin: "admin@foodexpress.local / Admin123!",
    restaurateur: "restaurateur@foodexpress.local / Restaurateur123!",
    client: "client@foodexpress.local / Client123!"
  });

  await mongoose.disconnect();
};

seed().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
