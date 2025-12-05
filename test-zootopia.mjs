import pkg from "./src/lib/moviebox.js";
const { movieBox } = pkg;

const testZootopia = async () => {
    console.log("🔍 Searching for 'Zootopia'...");
    const searchResults = await movieBox.search("Zootopia");

    if (!searchResults || searchResults.length === 0) {
        console.error("❌ No results found for 'Zootopia'");
        return;
    }

    const movie = searchResults[0];
    console.log(`✅ Found: ${movie.title} (ID: ${movie.id || movie.subjectId})`);
    console.log(`   Detail Path: ${movie.detailPath}`);

    if (!movie.detailPath) {
        console.error("❌ No detailPath found in search result. Cannot fetch details or sources.");
        return;
    }

    console.log("\n📄 Fetching Details...");
    const details = await movieBox.getDetails(movie.id || movie.subjectId, movie.detailPath);
    if (details) {
        console.log("✅ Details Fetched:");
        console.log(`   Title: ${details.title}`);
        console.log(`   Description: ${details.intro ? details.intro.substring(0, 50) + "..." : "N/A"}`);
        console.log(`   Seasons: ${details.seasons_count || "N/A"}`);
    } else {
        console.error("❌ Failed to fetch details.");
    }

    console.log("\n🎥 Fetching Sources...");
    // Assuming it's a movie, season 1 episode 1
    const sources = await movieBox.getSources(movie.id || movie.subjectId, movie.detailPath, 1, 1);

    if (sources) {
        console.log("✅ Sources Fetched:");
        if (sources.list) {
            sources.list.forEach(s => {
                console.log(`   - ${s.quality || "Unknown Quality"}: ${s.path}`);
            });
        } else {
            console.log(sources);
        }
    } else {
        console.error("❌ Failed to fetch sources.");
    }
};

testZootopia();
