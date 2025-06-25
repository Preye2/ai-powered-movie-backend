import dotenv from 'dotenv';
dotenv.config(); // ✅ Load environment variables

import axios from 'axios';

const tmdb = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  params: {
    api_key: process.env.TMDB_API_KEY,
    language: 'en-US',
  },
});

// 🔍 Search TMDB for a movie by title
export const searchTMDBMovie = async (title) => {
  try {
    const response = await tmdb.get('/search/movie', {
      params: { query: title },
    });

    const results = response.data?.results || [];
    return results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error(`❌ TMDB search error for "${title}":`, error.message);
    return null;
  }
};

// 🔥 Fetch trending movies (e.g., for homepage carousel)
export const fetchTrendingMovies = async () => {
  try {
    const response = await tmdb.get('/trending/movie/week');
    return response.data.results;
  } catch (error) {
    console.error('❌ TMDB fetchTrendingMovies error:', error.message);
    throw new Error('Failed to fetch trending movies from TMDB');
  }
};

// 🧠 Get real discoverable movies from TMDB based on filters
export const getTMDBDiscoverMovies = async ({ genre, language, decade, page = 1 }) => {
  try {
    const genreMap = {
      Action: 28,
      Drama: 18,
      Comedy: 35,
      Romance: 10749,
      Thriller: 53,
      Horror: 27,
      Adventure: 12,
    };

    const genreId = genreMap[genre] || undefined;
    const languageCode = language ? language.slice(0, 2).toLowerCase() : undefined;
    const decadeStart = decade ? parseInt(decade.slice(0, 4)) : 2000;
    const decadeEnd = decadeStart + 9;

    const res = await tmdb.get('/discover/movie', {
      params: {
        with_genres: genreId,
        with_original_language: languageCode,
        sort_by: 'popularity.desc',
        'primary_release_date.gte': `${decadeStart}-01-01`,
        'primary_release_date.lte': `${decadeEnd}-12-31`,
        page,
      },
    });

    return res.data.results.map(movie => ({
      title: movie.title,
      overview: movie.overview,
      poster_path: movie.poster_path,
      genre_ids: movie.genre_ids,
      rating: movie.vote_average,
      id: movie.id,
    }));
  } catch (error) {
    console.error('❌ TMDB discover failed:', error.message);
    return [];
  }
};

// 🎬 Get full movie details (incl. genres)
export const getMovieDetails = async (id) => {
  try {
    const res = await tmdb.get(`/movie/${id}`);
    return res.data;
  } catch (error) {
    console.error(`❌ getMovieDetails failed for ID ${id}:`, error.message);
    return null;
  }
};

// 👥 Get movie credits (cast & crew)
export const getMovieCredits = async (id) => {
  try {
    const res = await tmdb.get(`/movie/${id}/credits`);
    return res.data;
  } catch (error) {
    console.error(`❌ getMovieCredits failed for ID ${id}:`, error.message);
    return null;
  }
};

// 📺 Get movie videos (trailers, clips)
export const getMovieVideos = async (id) => {
  try {
    const res = await tmdb.get(`/movie/${id}/videos`);
    return res.data;
  } catch (error) {
    console.error(`❌ getMovieVideos failed for ID ${id}:`, error.message);
    return null;
  }
};

export default tmdb;
