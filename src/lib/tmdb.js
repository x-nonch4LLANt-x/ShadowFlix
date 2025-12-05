import axios from "axios";

const TMDB_API_KEY = "8647c2e449b4566703d99da7b4c7f5ce";
const BASE_URL = "https://api.themoviedb.org/3";

const tmdb = axios.create({
    baseURL: BASE_URL,
    params: {
        api_key: TMDB_API_KEY,
    },
});

export const getTmdbDetails = async (imdbId, title, year, isMovie = true) => {
    try {
        let tmdbId = null;

        // 1. Try to find by IMDb ID
        if (imdbId) {
            const findRes = await tmdb.get(`/find/${imdbId}`, {
                params: { external_source: "imdb_id" },
            });
            const results = isMovie ? findRes.data.movie_results : findRes.data.tv_results;
            if (results && results.length > 0) {
                tmdbId = results[0].id;
            }
        }

        // 2. If no IMDb ID or not found, search by title
        if (!tmdbId && title) {
            const searchRes = await tmdb.get(`/search/${isMovie ? "movie" : "tv"}`, {
                params: { query: title, year: year },
            });
            if (searchRes.data.results && searchRes.data.results.length > 0) {
                tmdbId = searchRes.data.results[0].id;
            }
        }

        if (!tmdbId) return null;

        // 3. Fetch details with credits and reviews and recommendations
        const detailsRes = await tmdb.get(`/${isMovie ? "movie" : "tv"}/${tmdbId}`, {
            params: { append_to_response: "credits,reviews,recommendations" },
        });

        return detailsRes.data;
    } catch (error) {
        console.error("TMDb Error:", error.message);
        return null;
    }
};
