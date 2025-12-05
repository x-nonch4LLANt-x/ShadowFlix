const { searchContent } = require('./src/lib/api');

// Mock the axios instance since we are running in node
const axios = require('axios');
const api = axios.create({
    baseURL: 'http://localhost:8000',
});

// Redefine searchContent to use the local axios instance for this script
const search = async (query) => {
    try {
        const response = await api.get(`/search?q=${encodeURIComponent(query)}`);
        return response.data;
    } catch (error) {
        console.error(`Error searching for ${query}:`, error.message);
        return [];
    }
};

const titles = [
    "Kpop Demon Hunter",
    "The Family Plan",
    "The Bad Guys 2",
    "Red One",
    "Zootopia 2",
    "Tron: Ares",
    "Fatal Seduction",
    "Mufasa: The Lion King"
];

async function fetchImages() {
    for (const title of titles) {
        console.log(`Searching for: ${title}`);
        const results = await search(title);
        if (results && results.length > 0) {
            // Try to find exact match or take first
            const match = results[0];
            console.log(`FOUND ${title}:`);
            console.log(`  Backdrop: ${match.backdrop_path}`);
            console.log(`  Poster: ${match.poster_path}`);
            console.log(`  Title: ${match.title || match.name}`);
            console.log(`  Overview: ${match.overview ? match.overview.substring(0, 50) + '...' : 'No overview'}`);
        } else {
            console.log(`NOT FOUND: ${title}`);
        }
        console.log('---');
    }
}

fetchImages();
