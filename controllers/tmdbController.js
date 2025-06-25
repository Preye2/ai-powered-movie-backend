import axios from 'axios';

const TMDB_API_KEY = process.env.TMDB_API_KEY;

// Trending movies
export const getTrendingMovies = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const { data } = await axios.get('https://api.themoviedb.org/3/trending/movie/week', {
      params: {
        api_key: TMDB_API_KEY,
        language: 'en-US',
        page,
      },
    });
    res.json(data.results);
  } catch (error) {
    console.error('❌ Error fetching trending movies:', error.message);
    res.status(500).json({ message: 'Failed to fetch trending movies' });
  }
};

// 🎬 Single movie details
export const getMovieDetails = async (req, res) => {
  const { id } = req.params;
  try {
    const { data } = await axios.get(`https://api.themoviedb.org/3/movie/${id}`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'en-US',
      },
    });
    res.json(data);
  } catch (error) {
    console.error('❌ Error fetching movie details:', error.message);
    res.status(500).json({ message: 'Failed to fetch movie details' });
  }
};

// 👨‍👩‍👧‍👦 NEW: Movie cast/credits
export const getMovieCredits = async (req, res) => {
  const { id } = req.params;
  try {
    const { data } = await axios.get(`https://api.themoviedb.org/3/movie/${id}/credits`, {
      params: {
        api_key: TMDB_API_KEY,
      },
    });
    res.json(data);
  } catch (error) {
    console.error('❌ Error fetching movie credits:', error.message);
    res.status(500).json({ message: 'Failed to fetch movie credits' });
  }
};

// 📺 NEW: Movie videos/trailers
export const getMovieVideos = async (req, res) => {
  const { id } = req.params;
  try {
    const { data } = await axios.get(`https://api.themoviedb.org/3/movie/${id}/videos`, {
      params: {
        api_key: TMDB_API_KEY,
      },
    });
    res.json(data);
  } catch (error) {
    console.error('❌ Error fetching movie videos:', error.message);
    res.status(500).json({ message: 'Failed to fetch movie videos' });
  }
};

// 🔍 Search movies by query
export const searchMovies = async (req, res) => {
  try {
    const query = req.query.query;
    if (!query) return res.status(400).json({ message: 'Missing search query' });

    const { data } = await axios.get(`https://api.themoviedb.org/3/search/movie`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'en-US',
        query,
      },
    });
    res.json(data.results);
  } catch (error) {
    console.error('❌ Error searching movies:', error.message);
    res.status(500).json({ message: 'Search failed' });
  }
};

// 🧠 Discover movies (for AI)
export const discoverMoviesFromTMDB = async (req, res) => {
  try {
    const { genre, language, decade } = req.query;

    const genreMap = {
      Action: 28,
      Adventure: 12,
      Animation: 16,
      Comedy: 35,
      Crime: 80,
      Documentary: 99,
      Drama: 18,
      Family: 10751,
      Fantasy: 14,
      History: 36,
      Horror: 27,
      Music: 10402,
      Mystery: 9648,
      Romance: 10749,
      'Science Fiction': 878,
      'TV Movie': 10770,
      Thriller: 53,
      War: 10752,
      Western: 37,
    };

    const genreId = genreMap[genre] || undefined;

    let primary_release_date_gte, primary_release_date_lte;
    if (decade && /^\d{4}s$/.test(decade)) {
      const yearStart = parseInt(decade.substring(0, 4));
      const yearEnd = yearStart + 9;
      primary_release_date_gte = `${yearStart}-01-01`;
      primary_release_date_lte = `${yearEnd}-12-31`;
    }

    console.log('Discover params:', {
      genreId,
      language,
      primary_release_date_gte,
      primary_release_date_lte,
    });

    const { data } = await axios.get('https://api.themoviedb.org/3/discover/movie', {
      params: {
        api_key: TMDB_API_KEY,
        language: 'en-US',
        with_genres: genreId,
        with_original_language: language ? language.toLowerCase().slice(0, 2) : undefined,
        sort_by: 'popularity.desc',
        'primary_release_date.gte': primary_release_date_gte,
        'primary_release_date.lte': primary_release_date_lte,
        page: 1,
      },
    });

    if (!data.results || data.results.length === 0) {
      return res.status(404).json({ message: 'No TMDB movies found for the selected criteria.' });
    }

    const movies = data.results.map((movie) => ({
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      poster_path: movie.poster_path,
      genre_ids: movie.genre_ids,
      rating: movie.vote_average,
    }));

    res.json(movies);
  } catch (error) {
    console.error('❌ TMDB discover error:', error.message);
    res.status(500).json({ message: 'Failed to discover movies' });
  }
};
