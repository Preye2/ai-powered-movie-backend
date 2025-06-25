// backend/controllers/favoriteController.js
import Favorite from '../models/Favorite.js';
import axios from 'axios';


// ✅ Add a movie to favorites
export const addFavorite = async (req, res) => {
  try {
    console.log("🛠️ addFavorite called");
    console.log("User:", req.user);
    console.log("Body:", req.body);

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const { movieId, title, poster_path, release_date } = req.body;

    if (!movieId || !title) {
      return res.status(400).json({ message: "movieId and title are required" });
    }

    const movieIdStr = movieId.toString(); // ✅ ensure it's a string

    const existing = await Favorite.findOne({ userId, movieId: movieIdStr });
    if (existing) {
      return res.status(400).json({ message: "Movie already in favorites" });
    }

    const favorite = new Favorite({
      userId,
      movieId: movieIdStr,
      movieTitle: title,
      poster_path,
      release_date,
    });

    await favorite.save();
    res.status(201).json(favorite);
  } catch (error) {
    console.error("❌ Add favorite error:", error);
    res.status(500).json({ message: "Failed to add favorite", error: error.message });
  }
};

// ✅ Remove a movie from favorites
export const removeFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const movieId = req.params.movieId.toString(); // ✅ ensure it's a string

    const deleted = await Favorite.findOneAndDelete({ userId, movieId });
    if (!deleted) {
      return res.status(404).json({ message: "Favorite not found" });
    }

    res.json({ message: "Favorite removed" });
  } catch (error) {
    console.error("❌ Remove favorite error:", error);
    res.status(500).json({ message: "Failed to remove favorite" });
  }
};

// ✅ Get all favorites for a user
export const getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;

    const favorites = await Favorite.find({ userId });

    const enrichedFavorites = await Promise.all(
      favorites.map(async (fav) => {
        try {
          const searchUrl = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(fav.movieTitle)}&api_key=${process.env.TMDB_API_KEY}`;
          const response = await axios.get(searchUrl);
          const movieData = response.data.results?.[0];

          return {
            movieTitle: fav.movieTitle,
            movieId: fav.movieId,
            release_date: fav.release_date,
            poster_path: movieData?.poster_path || fav.poster_path,
            tmdb: movieData || null,
          };
        } catch (err) {
          console.warn(`⚠️ TMDB fetch failed for ${fav.movieTitle}`, err.message);
          return {
            movieTitle: fav.movieTitle,
            movieId: fav.movieId,
            release_date: fav.release_date,
            poster_path: fav.poster_path,
            tmdb: null,
          };
        }
      })
    );

    res.status(200).json(enrichedFavorites);
  } catch (error) {
    console.error("❌ Get favorites error:", error);
    res.status(500).json({ message: "Failed to get favorites" });
  }
};