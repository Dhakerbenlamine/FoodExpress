const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: [true, "Le nom est obligatoire"],
      trim: true
    },
    prenom: {
      type: String,
      required: [true, "Le prénom est obligatoire"],
      trim: true
    },
    email: {
      type: String,
      required: [true, "L'email est obligatoire"],
      unique: true,
      lowercase: true,
      trim: true
    },
    telephone: {
      type: String,
      required: [true, "Le téléphone est obligatoire"],
      trim: true
    },
    password: {
      type: String,
      required: [true, "Le mot de passe est obligatoire"],
      select: false
    },
    role: {
      type: String,
      enum: ["client", "restaurateur", "admin"],
      default: "client"
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Hash le mot de passe uniquement lorsqu'il est créé ou modifié.
userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Vérifie un mot de passe en clair contre son hash.
userSchema.methods.comparePassword = function comparePassword(password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", userSchema);
