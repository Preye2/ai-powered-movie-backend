// backend/models/favorite.js
import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  movieId: {
    type: Number,
    required: true,
  },
  movieTitle: {
    type: String,
    required: true,
  },
  moviePoster: {
    type: String,
  },
}, { timestamps: true });

const Favorite = mongoose.model("Favorite", favoriteSchema);

export default Favorite;
