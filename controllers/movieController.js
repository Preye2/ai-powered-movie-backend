// backend/controllers/movieController.js
import tmdb from '../utils/tmdb.js';

export const getPopularMovies = async (req, res) => {
  try {
    const { data } = await tmdb.get('/movie/popular');
    res.json(data.results);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch popular movies' });
  }
};

export const searchMovies = async (req, res) => {
  try {
    const { query } = req.query;
    const { data } = await tmdb.get('/search/movie', { params: { query } });
    res.json(data.results);
  } catch (err) {
    res.status(500).json({ message: 'Search failed' });
  }
};

export const getMovieDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { data } = await tmdb.get(`/movie/${id}`);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Could not get movie details' });
  }
};

export const filterMovies = async (req, res) => {
  try {
    const { rating, year, sort_by } = req.query;
    const { data } = await tmdb.get('/discover/movie', {
      params: {
        'vote_average.gte': rating || 0,
        'primary_release_year': year || undefined,
        'sort_by': sort_by || 'popularity.desc',
      },
    });
    res.json(data.results);
  } catch (err) {
    res.status(500).json({ message: 'Failed to filter movies' });
  }
};
