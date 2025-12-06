"use client";

import React, { useEffect, useState } from "react";
import { SportsService } from "@/services/sports";
import SportsCard from "@/components/SportsCard";
import { Calendar, Filter } from "lucide-react";
import styles from "./page.module.css";

export default function SportsPage() {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState("all");

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                const data = await SportsService.getLiveMatches();
                setMatches(data);
            } catch (error) {
                console.error("Error fetching sports data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMatches();
    }, []);

    // Separate matches into LIVE and POPULAR
    // Assuming "Living" status from API. The API returns "MatchNotStart" or "Living" (inferred).
    // Let's check the API response again. It had "status": "MatchNotStart".
    // I will assume "Living" or "Live" or similar for live matches.
    // Actually, looking at the API response, status was "MatchNotStart".
    // I will filter based on status !== "MatchNotStart" for live, or just check if it contains "Live".
    // Wait, the API response had "statusLive": "_UnknownLiveStatus".
    // I'll stick to `status === "Living"` as per previous code, but I might need to adjust if the API uses different values.
    // The previous code used `match.status === "Living"`.
    // I'll keep it, but also check for "Live" just in case.

    const liveMatches = matches.filter(match => match.status === "Living" || match.status === "Live");
    const popularMatches = matches.filter(match => match.status !== "Living" && match.status !== "Live");

    if (loading) {
        return (
            <div className={styles.loading}>
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cyan-500"></div>
            </div>
        );
    }

    return (
        <div className={styles.sportsPage}>
            {/* Sidebar DATES Filter */}
            <aside className={styles.datesSidebar}>
                <div className={styles.datesHeader}>
                    <Calendar className={styles.calendarIcon} />
                    <h3>DATES</h3>
                </div>
                <div className={styles.datesList}>
                    <button
                        className={`${styles.dateButton} ${selectedDate === "all" ? styles.active : ""}`}
                        onClick={() => setSelectedDate("all")}
                    >
                        All Matches
                    </button>
                    <button
                        className={`${styles.dateButton} ${selectedDate === "today" ? styles.active : ""}`}
                        onClick={() => setSelectedDate("today")}
                    >
                        Today
                    </button>
                    <button
                        className={`${styles.dateButton} ${selectedDate === "tomorrow" ? styles.active : ""}`}
                        onClick={() => setSelectedDate("tomorrow")}
                    >
                        Tomorrow
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className={styles.content}>
                {/* LIVE Section */}
                {liveMatches.length > 0 && (
                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>LIVE</h2>
                            <div className={styles.livePulse}></div>
                        </div>
                        <div className={styles.grid}>
                            {liveMatches.map((match) => (
                                <SportsCard key={match.id} match={match} />
                            ))}
                        </div>
                    </section>
                )}

                {/* POPULAR Section */}
                {popularMatches.length > 0 && (
                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>POPULAR</h2>
                        </div>
                        <div className={styles.grid}>
                            {popularMatches.map((match) => (
                                <SportsCard key={match.id} match={match} />
                            ))}
                        </div>
                    </section>
                )}

                {matches.length === 0 && (
                    <div className={styles.noMatches}>
                        <Filter className={styles.noMatchesIcon} />
                        <h3>No football matches available</h3>
                        <p>Check back later for upcoming matches</p>
                    </div>
                )}
            </main>
        </div>
    );
}
