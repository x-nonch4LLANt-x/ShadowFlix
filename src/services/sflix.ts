import axios from "axios";
import * as cheerio from "cheerio";

const SFLIX_BASE_URL = "https://sflix.to"; // Redirects to sflix.ps

export interface SflixItem {
    title: string;
    link: string;
    poster?: string;
    year?: string;
}

export const SflixService = {
    /**
     * Search Sflix
     */
    search: async (keyword: string): Promise<SflixItem[]> => {
        try {
            const res = await axios.get(`${SFLIX_BASE_URL}/search/${encodeURIComponent(keyword)}`, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                }
            });

            const $ = cheerio.load(res.data);
            const results: SflixItem[] = [];

            $(".flw-item").each((_, el) => {
                const titleEl = $(el).find(".film-name a");
                const posterEl = $(el).find(".film-poster img");
                const linkEl = $(el).find(".film-poster a");
                const yearEl = $(el).find(".fdi-item");

                if (titleEl.length && linkEl.length) {
                    results.push({
                        title: titleEl.text().trim(),
                        link: `${SFLIX_BASE_URL}${linkEl.attr("href")}`,
                        poster: posterEl.attr("data-src"),
                        year: yearEl.first().text().trim() || "N/A"
                    });
                }
            });

            return results;
        } catch (error) {
            console.error("Sflix Search Error:", error);
            return [];
        }
    }
};
