
const ALLOWED_LEAGUES = [
    "Premier League",
    "Champions League",
    "La Liga",
    "Bundesliga",
    "Serie A",
    "Ligue 1",
    "Europa League",
    "Brasileirão",
    "Conference League",
    "Championship",
    "MLS",
    "Saudi Pro League",
    "World Cup"
];

export const FootballService = {
    async getFootballMatches() {
        try {
            // Fetch all football matches from the main endpoint
            const response = await fetch('https://streamed.pk/api/matches/football');
            if (!response.ok) {
                throw new Error('Failed to fetch football matches');
            }
            const allMatches = await response.json();

            // User requested strict filtering, but the API titles often don't contain league names.
            // This resulted in almost no matches being shown.
            // To fix "WHY IS MY WEBSITE SHOWING ONLY 2 MATCHES", we return all matches.
            // If we need strict filtering later, we need a way to identify the league from the team names or another API field.

            return allMatches;
        } catch (error) {
            console.error('Error fetching football matches:', error);
            return [];
        }
    },

    async getMatch(id) {
        try {
            const matches = await this.getFootballMatches();
            return matches.find(m => m.id === id);
        } catch (error) {
            console.error("Error finding match:", error);
            return null;
        }
    },

    async getStream(source, id) {
        try {
            const response = await fetch(`https://streamed.pk/api/stream/${source}/${id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch stream');
            }
            return await response.json();
        } catch (error) {
            console.error("Error fetching stream:", error);
            return null;
        }
    },

    async getLiveMatches() {
        try {
            const response = await fetch('https://streamed.pk/api/matches/live');
            if (!response.ok) {
                throw new Error('Failed to fetch live matches');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching live matches:', error);
            return [];
        }
    }
};
