import axios from "axios";
import { movieBox } from "@/lib/moviebox";

const API_URL = "/api/moviebox";

const baseURL = typeof window === "undefined"
    ? "http://localhost:3000/api/moviebox"
    : "/api/moviebox";

const api = axios.create({
    baseURL: baseURL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Helper to map MovieBox data to our app's format
// Note: We need to inspect the actual response to refine this.
// Based on typical MovieBox/Sflix APIs:
// title, poster, id, year, etc.
// Helper to map MovieBox data to our app's format
const mapMovieBoxItem = (item) => {
    const title = item.title || item.name || item.word || "Unknown";
    const poster = item.poster_url || item.cover?.url || item.cover || item.poster || item.img || "https://via.placeholder.com/500x750?text=No+Image";
    const id = item.subjectId || item.id || item.mid || item.tid;

    return {
        id: id,
        imdb_id: id, // Use internal ID as fallback
        title: title,
        poster_url: poster,
        cover: poster, // Fallback
        year: (item.releaseDate || item.publish_time || item.year || "").substring(0, 4),
        overview: item.intro || item.description || "",
        rating: item.score || item.rating || 0,
        subjectType: item.subjectType || (item.module === 1 ? 1 : 2),
        is_movie: (item.subjectType === 1) || (item.module === 1),
        detailPath: item.detailPath || "",
        // Add cast if available (usually in details, but sometimes in search results)
        casts: item.actors || item.casts || [],
    };
};

// Helper to extract list from various response structures
const extractList = (data) => {
    const innerData = data.data || data;
    if (Array.isArray(innerData)) return innerData;
    if (innerData.list) return innerData.list;
    if (innerData.results) return innerData.results;
    if (innerData.items) return innerData.items;
    if (innerData.movie) return innerData.movie;
    if (innerData.tv) return innerData.tv;

    // Fallback: check if any value is an array
    const arrays = Object.values(innerData).filter(v => Array.isArray(v));
    if (arrays.length > 0) return arrays[0];

    return [];
};

export const getTrending = async () => {
    if (typeof window === "undefined") {
        try {
            const data = await movieBox.getTrending();
            return extractList(data).map(mapMovieBoxItem);
        } catch (error) {
            console.error("Error fetching trending (server):", error);
            return [];
        }
    }
    try {
        const response = await api.get("", {
            params: { endpoint: "trending" },
        });
        return extractList(response.data).map(mapMovieBoxItem);
    } catch (error) {
        console.error("Error fetching trending:", error);
        return [];
    }
};

export const getMovies = async () => {
    if (typeof window === "undefined") {
        try {
            const data = await movieBox.getMovies();
            return extractList(data).map(mapMovieBoxItem);
        } catch (error) {
            console.error("Error fetching movies (server):", error);
            return [];
        }
    }
    try {
        const response = await api.get("", {
            params: { endpoint: "movies" },
        });
        return extractList(response.data).map(mapMovieBoxItem);
    } catch (error) {
        console.error("Error fetching movies:", error);
        return [];
    }
};

export const getSeries = async () => {
    if (typeof window === "undefined") {
        try {
            const data = await movieBox.getSeries();
            return extractList(data).map(mapMovieBoxItem);
        } catch (error) {
            console.error("Error fetching series (server):", error);
            return [];
        }
    }
    try {
        const response = await api.get("", {
            params: { endpoint: "series" },
        });
        return extractList(response.data).map(mapMovieBoxItem);
    } catch (error) {
        console.error("Error fetching series:", error);
        return [];
    }
};

export const getAnimations = async () => {
    return searchContent("Animation", 1);
};

export const getFestiveContent = async () => {
    return searchContent("Christmas", 1);
};

export const searchContent = async (query, page = 1) => {
    if (typeof window === "undefined") {
        try {
            const data = await movieBox.search(query.trim(), page);
            return extractList(data).map(mapMovieBoxItem);
        } catch (error) {
            console.error("Error searching (server):", error);
            return [];
        }
    }
    try {
        const response = await api.get("", {
            params: { endpoint: "search", query: query.trim(), page },
        });
        return extractList(response.data).map(mapMovieBoxItem);
    } catch (error) {
        console.error("Error searching:", error);
        return [];
    }
};

export const getSuggestions = async (query) => {
    if (typeof window === "undefined") {
        try {
            const data = await movieBox.getSuggestions(query.trim());
            return extractList(data).map(mapMovieBoxItem);
        } catch (error) {
            console.error("Error fetching suggestions (server):", error);
            return [];
        }
    }
    try {
        const response = await api.get("", {
            params: { endpoint: "suggestions", query: query.trim() },
        });
        return extractList(response.data).map(mapMovieBoxItem);
    } catch (error) {
        console.error("Error fetching suggestions:", error);
        return [];
    }
};

const mapMovieBoxDetails = (item) => {
    if (!item) return null;
    const title = item.title || item.name || "Unknown";
    const poster = item.cover?.url || item.cover || item.poster || item.img || "https://via.placeholder.com/500x750?text=No+Image";
    const id = item.subjectId || item.id;

    return {
        id: id,
        imdb_id: id,
        title: title,
        poster_url: poster,
        backdrop_url: poster, // MovieBox might not have separate backdrop, use poster or look for other fields
        year: (item.releaseDate || item.publish_time || item.year || "").substring(0, 4),
        overview: item.intro || item.description || "",
        rating: item.score || item.rating || 0,
        runtime: item.runtime || (item.duration ? `${item.duration} min` : ""),
        seasons: item.seasons_count || (item.seasons ? item.seasons.length : 0),
        is_series: item.subjectType === 2 || item.module === 2 || !!item.seasons,
        detailPath: item.detailPath || "",
        // Add other fields if available
    };
};

export const getDetails = async (id, detailPath) => {
    if (typeof window === "undefined") {
        try {
            const data = await movieBox.getDetails(id, detailPath);
            return mapMovieBoxDetails(data);
        } catch (error) {
            console.error("Error fetching details (server):", error);
            return null;
        }
    }
    try {
        const response = await api.get("", {
            params: { endpoint: "details", id, detailPath },
        });
        return mapMovieBoxDetails(response.data);
    } catch (error) {
        console.error("Error fetching details:", error);
        return null;
    }
};

export const getSources = async (id, detailPath, season = 1, episode = 1) => {
    if (typeof window === "undefined") {
        try {
            const data = await movieBox.getSources(id, detailPath, season, episode);
            return data;
        } catch (error) {
            console.error("Error fetching sources (server):", error);
            return null;
        }
    }
    try {
        const response = await api.get("", {
            params: {
                endpoint: "sources",
                id,
                detailPath,
                season,
                episode
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching sources:", error);
        return null;
    }
};

export default api;
