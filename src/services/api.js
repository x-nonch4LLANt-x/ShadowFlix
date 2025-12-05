import axios from "axios";

// Android Emulator uses 10.0.2.2 for localhost
const API_URL = "http://10.0.2.2:8000";

const api = axios.create({
    baseURL: API_URL,
});

export const getTrending = async () => {
    try {
        const response = await api.get("/trending");
        return response.data;
    } catch (error) {
        console.error("Error fetching trending:", error);
        return [];
    }
};

export const searchContent = async (query, page = 1) => {
    try {
        const response = await api.get("/search", { params: { q: query, page } });
        return response.data;
    } catch (error) {
        console.error("Error searching:", error);
        return [];
    }
};

export const getDetails = async (id) => {
    try {
        // Try movie first, then tv
        try {
            const response = await api.get(`/movie/${id}`);
            return response.data;
        } catch (e) {
            const response = await api.get(`/tv/${id}`);
            return response.data;
        }
    } catch (error) {
        console.error("Error fetching details:", error);
        return null;
    }
};

export const getSources = async (id, season = null, episode = null) => {
    try {
        const params = {};
        if (season) params.season = season;
        if (episode) params.episode = episode;

        const response = await api.get(`/sources/${id}`, { params });
        return response.data;
    } catch (error) {
        console.error("Error fetching sources:", error);
        return null;
    }
};

export default api;
