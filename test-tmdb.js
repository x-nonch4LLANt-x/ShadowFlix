// Standalone test script

// Mock axios since we are running in node and the file uses import
// Actually, the file uses 'import axios from "axios"', so we need to run this with esm or change the file to commonjs.
// But since I can't easily change the project configuration, I'll just write a standalone script that imports axios directly and copies the logic.

const axios = require("axios");
const TMDB_API_KEY = "8647c2e449b4566703d99da7b4c7f5ce";
const BASE_URL = "https://api.themoviedb.org/3";

const tmdb = axios.create({
    baseURL: BASE_URL,
    params: {
        api_key: TMDB_API_KEY,
    },
});

const getTmdbDetailsTest = async (title, year, isMovie = true) => {
    try {
        console.log(`Searching for: ${title} (${year})`);
        const searchRes = await tmdb.get(`/search/${isMovie ? "movie" : "tv"}`, {
            params: { query: title, year: year },
        });

        if (searchRes.data.results && searchRes.data.results.length > 0) {
            const item = searchRes.data.results[0];
            console.log(`Found: ${item.title || item.name} (ID: ${item.id})`);

            const detailsRes = await tmdb.get(`/${isMovie ? "movie" : "tv"}/${item.id}`, {
                params: { append_to_response: "credits,reviews" },
            });

            const data = detailsRes.data;
            console.log("\n--- Cast (Top 3) ---");
            data.credits.cast.slice(0, 3).forEach(c => console.log(`${c.name} as ${c.character}`));

            console.log("\n--- Reviews (Top 1) ---");
            if (data.reviews.results.length > 0) {
                console.log(data.reviews.results[0].content.substring(0, 100) + "...");
            } else {
                console.log("No reviews found.");
            }
        } else {
            console.log("Not found.");
        }
    } catch (error) {
        console.error("Error:", error.message);
    }
};

(async () => {
    await getTmdbDetailsTest("Inception", 2010, true);
})();
