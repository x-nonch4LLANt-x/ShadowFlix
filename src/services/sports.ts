import axios from "axios";

const API_URL = "https://h5.aoneroom.com/wefeed-h5-bff/live/match-list-v3";

export interface Team {
    id: string;
    name: string;
    score: string;
    avatar: string;
}

export interface Match {
    id: string;
    team1: Team;
    team2: Team;
    status: string; // "MatchNotStart", "Living", "MatchEnd"
    startTime: string; // Timestamp string
    league: string;
    playPath?: string; // Stream URL
}

export interface LeagueGroup {
    league: string;
    matchList: Match[];
}

export const SportsService = {
    /**
     * Get live football matches
     */
    getLiveMatches: async (): Promise<Match[]> => {
        try {
            // Calculate time range: Current time - 12 hours to + 48 hours to cover active and upcoming
            const now = Date.now();
            const startTime = now - 12 * 60 * 60 * 1000;
            const endTime = now + 48 * 60 * 60 * 1000;

            const response = await axios.get(API_URL, {
                params: {
                    status: 0, // 0 seems to be "all" or "upcoming/live"
                    matchType: "football",
                    startTime: startTime,
                    endTime: endTime
                },
                headers: {
                    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    "Origin": "https://sportslive.run",
                    "Referer": "https://sportslive.run/"
                }
            });

            if (response.data && response.data.code === 0 && response.data.data && response.data.data.list) {
                const leagueGroups: LeagueGroup[] = response.data.data.list;

                // Flatten the list of matches from all leagues
                let allMatches: Match[] = [];
                leagueGroups.forEach(group => {
                    if (group.matchList) {
                        allMatches = [...allMatches, ...group.matchList];
                    }
                });

                return allMatches;
            }

            return [];
        } catch (error) {
            console.error("Error fetching sports data:", error);
            return [];
        }
    },

    /**
     * Get details for a specific match by ID
     */
    getMatchDetails: async (id: string): Promise<Match | null> => {
        try {
            // Since we don't have a direct detail endpoint, we fetch the list and find the match.
            // This is acceptable as the list contains the stream URL.
            const matches = await SportsService.getLiveMatches();
            return matches.find(m => m.id === id) || null;
        } catch (error) {
            console.error("Error fetching match details:", error);
            return null;
        }
    }
};
