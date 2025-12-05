const { movieBox } = require("./src/lib/moviebox");

async function test() {
    console.log("Testing MovieBox API...");

    try {
        console.log("Fetching Trending...");
        const trending = await movieBox.getTrending();
        console.log("Trending Data Type:", typeof trending);
        console.log("Trending Data Keys:", Object.keys(trending || {}));
        if (trending && trending.data && Array.isArray(trending.data.list)) {
            console.log("Trending Items:", trending.data.list.length);
        } else {
            console.log("Trending structure might be different:", JSON.stringify(trending).substring(0, 200));
        }

        console.log("\nFetching Movies...");
        const movies = await movieBox.getMovies();
        console.log("Movies Data Type:", typeof movies);
        if (movies && movies.data && Array.isArray(movies.data.list)) {
            console.log("Movies Items:", movies.data.list.length);
        } else {
            console.log("Movies structure might be different:", JSON.stringify(movies).substring(0, 200));
        }

        console.log("\nFetching Series...");
        const series = await movieBox.getSeries();
        console.log("Series Data Type:", typeof series);
        if (series && series.data && Array.isArray(series.data.list)) {
            console.log("Series Items:", series.data.list.length);
        } else {
            console.log("Series structure might be different:", JSON.stringify(series).substring(0, 200));
        }

    } catch (e) {
        console.error("Test Error:", e);
    }
}

test();
