const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    adresse: { type: String, required: true, trim: true },
    typeCuisine: { type: String, required: true, trim: true },
    image: { type: String, default: "", trim: true },
    fraisLivraison: { type: Number, required: true, min: 0, default: 0 },
    horaires: { type: String, required: true, trim: true },
    isOpen: { type: Boolean, default: true },
    statutValidation: {
      type: String,
      enum: ["validee", "suspendue"],
      default: "validee"
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

restaurantSchema.index({ nom: "text", typeCuisine: 1 });

module.exports = mongoose.model("Restaurant", restaurantSchema);
