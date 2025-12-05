const axios = require("axios");

const BASE_URL = "https://h5.aoneroom.com/wefeed-h5-bff/web";
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

async function getSources(subjectId, detailPath, season = 1, episode = 1) {
    try {
        // Init session first (simplified)
        const initRes = await axios.get("https://h5.aoneroom.com/wefeed-h5-bff/app/get-latest-app-pkgs?app_name=moviebox", { headers: DEFAULT_HEADERS });
        const cookies = initRes.headers["set-cookie"]?.map(c => c.split(";")[0]).join("; ");

        const referer = `https://h5.aoneroom.com/movies/${detailPath}`;
        const response = await client.get("/subject/play", {
            params: { subjectId, se: season, ep: episode },
            headers: { "Referer": referer, "Cookie": cookies }
        });
        return response.data;
    } catch (error) {
        console.error("Sources error:", error.message);
        return null;
    }
}

(async () => {
    const id = "3344346067511956200";
    const detailPath = "wondla-CfmbYXH83Z3";
    console.log("Fetching sources for:", detailPath);

    const data = await getSources(id, detailPath);
    console.log("Data:", JSON.stringify(data, null, 2));

    if (data && data.data && data.data.streams) {
        const url = data.data.streams[0].url;
        console.log("\nTesting URL:", url);

        try {
            const check = await axios.head(url);
            console.log("URL Check Status:", check.status);
        } catch (e) {
            console.log("URL Check Failed:", e.message);
            if (e.response) console.log("Response Status:", e.response.status);
        }
    }
})();
