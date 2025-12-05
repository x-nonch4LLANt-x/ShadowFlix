import axios from "axios";

const TMDB_API_KEY = "8647c2e449b4566703d99da7b4c7f5ce";
const BASE_URL = "https://api.themoviedb.org/3";

const tmdb = axios.create({
    baseURL: BASE_URL,
    params: {
        api_key: TMDB_API_KEY,
    },
});

export interface TmdbDetails {
    id: number;
    title?: string;
    name?: string;
    overview: string;
    poster_path: string;
    backdrop_path: string;
    vote_average: number;
    release_date?: string;
    first_air_date?: string;
    credits?: {
        cast: any[];
        crew: any[];
    };
    recommendations?: {
        results: any[];
    };
    videos?: {
        results: any[];
    };
}

export const TmdbService = {
    /**
     * Search for a movie or TV show
     */
    search: async (query: string): Promise<any[]> => {
        try {
            const res = await tmdb.get("/search/multi", {
                params: { query },
            });
            return res.data.results || [];
        } catch (error) {
            console.error("TMDB Search Error:", error);
            return [];
        }
    },

    /**
     * Get details by ID (with credits, videos, recommendations)
     */
    getDetails: async (id: number, type: "movie" | "tv" = "movie"): Promise<TmdbDetails | null> => {
        try {
            const res = await tmdb.get(`/${type}/${id}`, {
                params: {
                    append_to_response: "credits,videos,recommendations,similar",
                },
            });
            return res.data;
        } catch (error) {
            console.error("TMDB Details Error:", error);
            return null;
        }
    },

    /**
     * Get trending items
     */
    getTrending: async (timeWindow: "day" | "week" = "week"): Promise<any[]> => {
        try {
            const res = await tmdb.get(`/trending/all/${timeWindow}`);
            return res.data.results || [];
        } catch (error) {
            console.error("TMDB Trending Error:", error);
            return [];
        }
    }
};
