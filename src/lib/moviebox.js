import axios from "axios";

const BASE_URL = "https://moviebox.ph/wefeed-h5-bff/web";

const DEFAULT_HEADERS = {
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:137.0) Gecko/20100101 Firefox/137.0",
    "Accept": "application/json, text/plain, */*",
    "Content-Type": "application/json",
    "Origin": "https://moviebox.ph",
    "Referer": "https://moviebox.ph/",
};

class MovieBoxAPI {
    constructor() {
        this.client = axios.create({
            baseURL: BASE_URL,
            headers: DEFAULT_HEADERS,
        });
        this.sessionInitialized = false;
    }

    async initSession() {
        if (this.sessionInitialized) return;
        try {
            // Use absolute URL to avoid baseURL issue
            const response = await axios.get("https://moviebox.ph/wefeed-h5-bff/app/get-latest-app-pkgs?app_name=moviebox", {
                headers: DEFAULT_HEADERS
            });
            const setCookie = response.headers["set-cookie"];
            if (setCookie) {
                const sessionCookies = setCookie.map(c => c.split(";")[0]).join("; ");
                console.log("MovieBox Session initialized");
                this.client.defaults.headers.common["Cookie"] = sessionCookies;
                this.sessionInitialized = true;
            }
        } catch (error) {
            console.error("MovieBox session init error:", error.message);
        }
    }

    async getTrending() {
        await this.initSession();
        try {
            // Endpoint: /subject/search-rank
            // Payload: {} or { subject_type: 0 } for all
            const response = await this.client.post("/subject/search-rank", {});
            return response.data;
        } catch (error) {
            console.error("MovieBox trending error:", error.message);
            return null;
        }
    }

    async getMovies() {
        await this.initSession();
        try {
            // Endpoint: /subject/search-rank
            // Payload: { subject_type: 1 }
            const response = await this.client.post("/subject/search-rank", { subject_type: 1 });
            return response.data;
        } catch (error) {
            console.error("MovieBox movies error:", error.message);
            return null;
        }
    }

    async getSeries() {
        await this.initSession();
        try {
            // Endpoint: /subject/search-rank
            // Payload: { subject_type: 2 }
            const response = await this.client.post("/subject/search-rank", { subject_type: 2 });
            return response.data;
        } catch (error) {
            console.error("MovieBox series error:", error.message);
            return null;
        }
    }

    async search(keyword, page = 1, perPage = 24) {
        try {
            // Endpoint: /subject/search
            // Payload: { keyword: "...", per_page: ... }
            const payload = {
                keyword: keyword,
                per_page: perPage,
                page: page, // Python wrapper didn't show page in the grep, but it's likely supported or handled via offset
            };
            await this.initSession();
            const response = await this.client.post("/subject/search", payload);
            return response.data;
        } catch (error) {
            console.error("MovieBox search error:", error.message);
            return null;
        }
    }

    async getSuggestions(keyword, perPage = 10) {
        try {
            // Endpoint: /subject/search-suggest
            // Payload: { keyword: "...", per_page: ... }
            const payload = {
                keyword: keyword,
                per_page: perPage,
            };
            await this.initSession();
            const response = await this.client.post("/subject/search-suggest", payload);
            return response.data;
        } catch (error) {
            console.error("MovieBox suggestions error:", error.message);
            return null;
        }
    }

    async getSources(subjectId, detailPath, season = 1, episode = 1) {
        try {
            // Endpoint: /subject/play
            // Payload: { subjectId, se, ep } (Query params in Python, but let's check if POST works or if we need GET)
            // Python wrapper uses GET with params.

            const referer = `https://moviebox.ph/movies/${detailPath}`;

            await this.initSession();
            const response = await this.client.get("/subject/play", {
                params: {
                    subjectId: subjectId,
                    se: season,
                    ep: episode,
                },
                headers: {
                    "Referer": referer,
                },
            });

            console.log("=== MovieBox getSources Response ===");
            console.log("SubjectId:", subjectId, "Season:", season, "Episode:", episode);
            console.log("Response structure:", JSON.stringify(response.data, null, 2));

            // Return the full response data - let the caller handle the structure
            return response.data;
        } catch (error) {
            console.error("MovieBox sources error:", error.message);
            console.error("Error details:", error);
            return null;
        }
    }

    async getDetails(subjectId, detailPath) {
        try {
            const url = `/movies/${detailPath}`;
            // We need to fetch the HTML page.
            // The client is configured with baseURL, but this is a full page fetch.
            // We can use the same client if we pass the full URL or relative to baseURL if it matches.
            // The baseURL is https://h5.aoneroom.com/wefeed-h5-bff/web/
            // The page URL is https://h5.aoneroom.com/movies/...
            // So we need to use a different instance or absolute URL.

            // Let's use a fresh axios call or the client if we can override baseURL.
            // We need cookies here too.
            await this.initSession();
            const cookies = this.client.defaults.headers.common["Cookie"];

            const response = await axios.get(`https://h5.aoneroom.com${url}`, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36",
                    "Cookie": cookies
                }
            });

            const html = response.data;

            // Extract JSON from <script
            const scriptRegex = /<script type="application\/json".*?>(.*?)<\/script>/s;
            const match = html.match(scriptRegex);

            if (!match || !match[1]) {
                console.error("Could not find JSON script in details page");
                return null;
            }

            const rawData = JSON.parse(match[1]);

            // Implement the resolve_value logic from Python wrapper
            const resolveValue = (value) => {
                if (Array.isArray(value)) {
                    return value.map(index => {
                        // In python: resolve_value(data[index] if type(index) is int else index)
                        // It seems the list contains indices pointing to rawData
                        if (typeof index === 'number') {
                            return resolveValue(rawData[index]);
                        }
                        return resolveValue(index);
                    });
                } else if (typeof value === 'object' && value !== null) {
                    const processed = {};
                    for (const [k, v] of Object.entries(value)) {
                        // In python: processed_value[k] = resolve_value(data[v])
                        // The values in the dict are indices into rawData
                        if (typeof v === 'number') {
                            processed[k] = resolveValue(rawData[v]);
                        } else {
                            processed[k] = resolveValue(v);
                        }
                    }
                    return processed;
                }
                return value;
            };

            // The python code iterates over data and extracts dicts.
            // "extracts = [] ... for entry in data: if type(entry) is dict: ..."
            // It seems the root data is a list.

            let details = null;
            if (Array.isArray(rawData)) {
                for (const entry of rawData) {
                    if (typeof entry === 'object' && entry !== null && !Array.isArray(entry)) {
                        // This is likely the root object structure (compressed)
                        // We need to resolve its values.
                        const resolvedEntry = {};
                        for (const [key, index] of Object.entries(entry)) {
                            if (typeof index === 'number') {
                                resolvedEntry[key] = resolveValue(rawData[index]);
                            } else {
                                resolvedEntry[key] = resolveValue(index);
                            }
                        }

                        // We are looking for the one with 'metadata', 'stars', etc.
                        if (resolvedEntry.metadata || resolvedEntry.title) {
                            details = resolvedEntry;
                            break;
                        }

                        // Fallback: just return the first resolved object
                        if (!details) details = resolvedEntry;
                    }
                }
            }

            if (!details) {
                console.warn("Could not resolve details from JSON");
                return null;
            }

            return details;

        } catch (error) {
            console.error("MovieBox details error:", error.message);
            return null;
        }
    }
}

export const movieBox = new MovieBoxAPI();
