"use client";

import React, { useEffect, useState } from "react";
import { FootballService } from "@/services/football";
import SportsCard from "@/components/SportsCard";
import { Calendar, Filter } from "lucide-react";
import styles from "./page.module.css";

export default function SportsPage() {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(null); // null means all, or we can default to today
    const [dates, setDates] = useState([]);

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                const data = await FootballService.getFootballMatches();
                setMatches(data);

                // Extract unique dates
                const uniqueDates = [...new Set(data.map(match => {
                    const d = new Date(match.date);
                    return d.toDateString();
                }))].sort((a, b) => new Date(a) - new Date(b));

                setDates(uniqueDates);

                // Default to first date if available, or "all" logic
                if (uniqueDates.length > 0) {
                    setSelectedDate(uniqueDates[0]);
                }

            } catch (error) {
                console.error("Error fetching sports data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMatches();
    }, []);

    const filteredMatches = selectedDate
        ? matches.filter(match => new Date(match.date).toDateString() === selectedDate)
        : matches;

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
                    {dates.map((dateStr) => {
                        const dateObj = new Date(dateStr);
                        const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
                        const dayNum = dateObj.getDate();
                        const month = dateObj.toLocaleDateString('en-US', { month: 'short' });

                        return (
                            <button
                                key={dateStr}
                                className={`${styles.dateButton} ${selectedDate === dateStr ? styles.active : ""}`}
                                onClick={() => setSelectedDate(dateStr)}
                            >
                                <span className={styles.dayName}>{dayName}</span>
                                <span className={styles.fullDate}>{dayNum} {month}</span>
                            </button>
                        );
                    })}
                </div>
            </aside>

            {/* Main Content */}
            <main className={styles.content}>
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>
                            {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : "All Matches"}
                        </h2>
                    </div>
                    <div className={styles.grid}>
                        {filteredMatches.map((match) => (
                            <SportsCard key={match.id} match={match} />
                        ))}
                    </div>
                </section>

                {filteredMatches.length === 0 && (
                    <div className={styles.noMatches}>
                        <Filter className={styles.noMatchesIcon} />
                        <h3>No matches found for this date</h3>
                    </div>
                )}
            </main>
        </div>
    );
}
