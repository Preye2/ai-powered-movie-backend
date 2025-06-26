import OpenAI from 'openai';
import dotenv from 'dotenv';
import {
  getTMDBDiscoverMovies,
  getMovieDetails,
  getMovieCredits,
  getMovieVideos
} from '../utils/tmdb.js';

dotenv.config();

console.log("🧪 Loaded OPENROUTER_API_KEY:", !!process.env.OPENROUTER_API_KEY);


const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
});

async function fetchMultiplePages({ genre, language, decade }, maxPages = 3) {
  let allMovies = [];
  for (let page = 1; page <= maxPages; page++) {
    const moviesPage = await getTMDBDiscoverMovies({ genre, language, decade, page });
    if (!moviesPage || moviesPage.length === 0) break;
    allMovies = allMovies.concat(moviesPage);
  }
  return allMovies;
}

export const recommendMovies = async (req, res) => {
  try {
    const { mood, genre, language, decade } = req.body;

    if (!mood || typeof mood !== 'string' || mood.trim() === '') {
      return res.status(400).json({ error: 'Mood is required.' });
    }

    const discoverResults = await fetchMultiplePages({ genre, language, decade }, 3);
    if (!discoverResults || discoverResults.length === 0) {
      return res.status(404).json({ error: 'No real movies found to recommend.' });
    }

    const movieList = discoverResults
      .slice(0, 30)
      .map((movie, i) => `${i + 1}. "${movie.title}" – ${movie.overview}`)
      .join('\n');

    const systemPrompt = `
You are a helpful AI movie assistant. The user is feeling "${mood}".
Below is a list of real TMDB movies:

${movieList}

Pick up to 10 movies that best fit the user's mood.
Respond in this exact format:
1. "Movie Title" - Short reason.
2. ...
Only choose from the list above. Do not invent titles.
`.trim();

      const completion = await axios.post(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      model: 'mistralai/mistral-7b-instruct',
      messages: [{ role: 'user', content: systemPrompt }],
    },
    {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const reply = completion.data?.choices?.[0]?.message?.content;
    console.log('🧠 AI raw reply:\n', reply);

    if (!reply) {
      return res.status(500).json({ error: 'Empty AI response. Try again later.' });
    }

    const recommendations = reply
      .split('\n')
      .filter(line => /^\d+\./.test(line))
      .map(line => {
        const [_, rest] = line.split('.');
        const [title, reason] = rest.split(' - ');
        return {
          title: title?.replace(/["']/g, '').trim() || '',
          reason: reason?.trim() || '',
        };
      })
      .filter(movie => movie.title);

    const enriched = await Promise.all(recommendations.map(async rec => {
      const match = discoverResults.find(
        m => m.title.toLowerCase() === rec.title.toLowerCase()
      );
      if (!match) return null;

      const [details, credits, videos] = await Promise.all([
        getMovieDetails(match.id),
        getMovieCredits(match.id),
        getMovieVideos(match.id),
      ]);

      const genres = details?.genres?.map(g => g.name) || [];
      const cast = credits?.cast?.slice(0, 5).map(c => c.name) || [];
      const trailerVideo = videos?.results?.find(
        v => v.type === 'Trailer' && v.site === 'YouTube'
      );
      const trailer = trailerVideo ? trailerVideo.key : null; // 🔥 Use only video key here

      return {
        title: rec.title,
        reason: rec.reason,
        id: match.id,
        poster_path: match.poster_path,
        genres,
        cast,
        trailer, // ✅ Send key only, not full URL
      };
    }));

    return res.status(200).json({
      recommendedMovies: enriched.filter(Boolean),
    });

  } catch (error) {
    console.error('❌ AI Recommendation Error:', error.message);
    return res.status(500).json({ error: 'AI recommendation failed. Try again later.' });
  }
};
