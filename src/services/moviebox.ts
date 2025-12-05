import { searchContent, getSources } from "@/lib/api";

export interface MovieboxItem {
    title: string;
    id: string; // The ID used in the URL (slug)
    subjectId: string; // The internal subject ID
    cover?: string;
    rating?: string;
    year?: string;
}

export const MovieboxService = {
    /**
     * Search for a movie/series on Moviebox to find its ID
     */
    search: async (keyword: string): Promise<MovieboxItem[]> => {
        try {
            const results = await searchContent(keyword);
            return results.map((item: any) => ({
                title: item.title,
                id: item.detailPath.replace("/detail/", "").replace("movies/", ""), // Extract slug
                subjectId: item.id,
                cover: item.poster_url,
                rating: item.rating,
                year: item.year
            }));
        } catch (error) {
            console.error("Moviebox Search Error:", error);
            return [];
        }
    },

    /**
     * Get the stream sources for a specific movie/series
     */
    getStreamSources: async (subjectId: string, detailPath: string, season: number = 1, episode: number = 1) => {
        try {
            // For movies, use season 0, episode 0
            // The caller should handle this, but we can default if needed.
            return await getSources(subjectId, detailPath, season, episode);
        } catch (error) {
            console.error("Moviebox Sources Error:", error);
            return null;
        }
    },

    /**
     * Get the player URL (Legacy/Fallback)
     */
    getPlayerUrl: (slug: string, id: string): string => {
        return `https://lok-lok.cc/spa/videoPlayPage/movies/${slug}?id=${id}`;
    }
};
