import axios from "axios";
import * as cheerio from "cheerio";

const MOVIEBOX_BASE_URL = "https://moviebox.ph";
const MOVIEBOX_SEARCH_URL = "https://moviebox.ph/web/searchResult";

export interface MovieboxItem {
    title: string;
    id: string; // The ID used in the URL
    subjectId: string; // The internal subject ID
    cover?: string;
    rating?: string;
}

export const MovieboxService = {
    /**
     * Search for a movie/series on Moviebox to find its ID
     */
    search: async (keyword: string): Promise<MovieboxItem[]> => {
        try {
            // We use the scraping method as the API only gives suggestions
            const res = await axios.get(MOVIEBOX_SEARCH_URL, {
                params: { keyword },
                headers: {
                    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8"
                }
            });

            const $ = cheerio.load(res.data);
            const results: MovieboxItem[] = [];

            $(".pc-card").each((_, el) => {
                const titleEl = $(el).find(".pc-card-title");
                const linkEl = $(el).attr("href"); // usually /detail/slug?id=...
                const imgEl = $(el).find(".pc-img-cot span").attr("data-src") || $(el).find("img").attr("src");
                const rateEl = $(el).find(".pc-rate");

                if (titleEl.length && linkEl) {
                    // Parse URL to get ID
                    // href format: /detail/zootopia-SxDV9XZ5kg6?id=5256777509147918584
                    const urlObj = new URL(linkEl, MOVIEBOX_BASE_URL);
                    const id = urlObj.searchParams.get("id");
                    const slug = linkEl.split("?")[0].replace("/detail/", "");

                    if (id && slug) {
                        results.push({
                            title: titleEl.text().trim(),
                            id: slug,
                            subjectId: id,
                            cover: imgEl,
                            rating: rateEl.text().trim()
                        });
                    }
                }
            });

            return results;
        } catch (error) {
            console.error("Moviebox Search Error:", error);
            return [];
        }
    },

    /**
     * Get the player URL for a specific movie/series
     */
    getPlayerUrl: (slug: string, id: string): string => {
        // Direct link to the player page
        // https://lok-lok.cc/spa/videoPlayPage/movies/zootopia-SxDV9XZ5kg6?id=5256777509147918584
        return `https://lok-lok.cc/spa/videoPlayPage/movies/${slug}?id=${id}`;
    },

    /**
     * (Advanced) Attempt to extract details if needed
     * This parses the <script type="application/json"> on the details page
     */
    getDetails: async (slug: string, id: string): Promise<any> => {
        try {
            const url = `${MOVIEBOX_BASE_URL}/detail/${slug}?id=${id}`;
            const res = await axios.get(url, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                }
            });

            const $ = cheerio.load(res.data);
            const scriptContent = $('script[type="application/json"]').html();

            if (scriptContent) {
                // The JSON is often a list of objects with references, might need complex parsing
                // For now, we return the raw parsed JSON
                return JSON.parse(scriptContent);
            }
            return null;
        } catch (error) {
            console.error("Moviebox Details Error:", error);
            return null;
        }
    }
};
