const fs = require("fs");
const axios = require("axios");

const BASE_URL = "https://h5.aoneroom.com/wefeed-h5-bff/web";

// ... (rest of imports)

const DEFAULT_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Content-Type": "application/json",
    "Origin": "https://h5.aoneroom.com",
    "Referer": "https://h5.aoneroom.com/",
};

const client = axios.create({
    baseURL: BASE_URL,
    headers: DEFAULT_HEADERS,
});

let sessionCookies = "";

async function initSession() {
    try {
        // Use absolute URL to avoid baseURL issue
        const response = await axios.get("https://h5.aoneroom.com/wefeed-h5-bff/app/get-latest-app-pkgs?app_name=moviebox", {
            headers: DEFAULT_HEADERS
        });
        const setCookie = response.headers["set-cookie"];
        if (setCookie) {
            sessionCookies = setCookie.map(c => c.split(";")[0]).join("; ");
            console.log("✅ Session initialized. Cookies:", sessionCookies);
            // Update client defaults
            client.defaults.headers.common["Cookie"] = sessionCookies;
        }
    } catch (error) {
        console.error("Session init error:", error.message);
    }
}

async function search(keyword) {
    if (!sessionCookies) await initSession();
    try {
        const response = await client.post("/subject/search", {
            keyword: keyword,
            per_page: 24,
            page: 1
        });
        return response.data;
    } catch (error) {
        console.error("Search error:", error.message);
        return null;
    }
}

async function getDetails(detailPath) {
    if (!sessionCookies) await initSession();
    try {
        const url = `/movies/${detailPath}`;
        const response = await axios.get(`https://h5.aoneroom.com${url}`, {
            headers: {
                "User-Agent": DEFAULT_HEADERS["User-Agent"],
                "Cookie": sessionCookies
            }
        });

        const html = response.data;
        // Regex to match script with type="application/json" and any other attributes
        const scriptRegex = /<script type="application\/json".*?>(.*?)<\/script>/s;
        const match = html.match(scriptRegex);

        if (!match || !match[1]) {
            console.error("❌ JSON script not found in HTML");
            console.log("Cookies used:", sessionCookies);
            // Write HTML to file for inspection
            fs.writeFileSync("debug_details.html", html);
            console.log("HTML written to debug_details.html");
            return null;
        }

        const rawData = JSON.parse(match[1]);

        const resolveValue = (value) => {
            if (Array.isArray(value)) {
                return value.map(index => {
                    if (typeof index === 'number') return resolveValue(rawData[index]);
                    return resolveValue(index);
                });
            } else if (typeof value === 'object' && value !== null) {
                const processed = {};
                for (const [k, v] of Object.entries(value)) {
                    if (typeof v === 'number') processed[k] = resolveValue(rawData[v]);
                    else processed[k] = resolveValue(v);
                }
                return processed;
            }
            return value;
        };

        let details = null;
        if (Array.isArray(rawData)) {
            for (const entry of rawData) {
                if (typeof entry === 'object' && entry !== null && !Array.isArray(entry)) {
                    const resolvedEntry = {};
                    for (const [key, index] of Object.entries(entry)) {
                        if (typeof index === 'number') resolvedEntry[key] = resolveValue(rawData[index]);
                        else resolvedEntry[key] = resolveValue(index);
                    }
                    if (resolvedEntry.metadata || resolvedEntry.title) {
                        details = resolvedEntry;
                        break;
                    }
                    if (!details) details = resolvedEntry;
                }
            }
        }
        return details;
    } catch (error) {
        console.error("Details error:", error.message);
        return null;
    }
}

async function getSources(subjectId, detailPath, season = 1, episode = 1) {
    if (!sessionCookies) await initSession();
    try {
        const referer = `https://h5.aoneroom.com/movies/${detailPath}`;
        const response = await client.get("/subject/play", {
            params: { subjectId, se: season, ep: episode },
            headers: { "Referer": referer, "Cookie": sessionCookies }
        });
        return response.data;
    } catch (error) {
        console.error("Sources error:", error.message);
        return null;
    }
}

(async () => {
    console.log("🔍 Searching for 'Zootopia'...");
    const searchResults = await search("Zootopia");

    const list = searchResults.list || (searchResults.data && searchResults.data.items);

    if (!list || list.length === 0) {
        console.error("❌ No results found");
        return;
    }

    console.log(`Found ${list.length} items. Checking for playable sources...`);

    for (const movie of list) {
        if (movie.subjectType !== 1 && movie.subjectType !== 2) continue;

        console.log(`\nChecking: ${movie.title} (ID: ${movie.id || movie.subjectId})`);

        // Try fetching sources
        const sources = await getSources(movie.id || movie.subjectId, movie.detailPath);

        if (sources && sources.data && sources.data.hasResource) {
            console.log("✅ Playable Source Found!");
            console.log(`   Detail Path: ${movie.detailPath}`);
            console.log("   Streams:", sources.data.streams || sources.data.hls || sources.data.dash);

            // Now try to get details for this one
            console.log("\n📄 Fetching Details for playable item...");
            const details = await getDetails(movie.detailPath);
            if (details) {
                console.log("✅ Details Fetched:");
                console.log(JSON.stringify(details, null, 2));
            } else {
                console.error("❌ Failed to fetch details (check debug_details.html).");
            }
            return; // Done
        } else {
            console.log("   ❌ No resources.");
        }
    }
    console.error("\n❌ No playable sources found in any results.");
})();
