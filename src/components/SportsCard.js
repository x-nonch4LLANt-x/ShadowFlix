import React from "react";
import Link from "next/link";
import { Play, Trophy, Star } from "lucide-react";
import styles from "./SportsCard.module.css";

export default function SportsCard({ match }) {
    const { id, teams, date, title } = match;

    if (!teams || !teams.home || !teams.away) {
        return null; // or render a skeleton/placeholder
    }

    const isLive = match.category === "live";

    // Let's assume the parent passes isLive or we check if the date is close to now?
    // The previous code checked status === "Living".
    // The new API doesn't seem to have a status field in the sample.
    // I will use the date for display.

    const matchDate = new Date(date);
    const timeString = matchDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });

    return (
        <Link href={`/watch/football/${id}`} className={styles.card}>
            {/* Top Bar: Time & Star */}
            <div className={styles.topBar}>
                {isLive ? (
                    <span className={styles.liveBadge}>{`{LIVE}`}</span>
                ) : (
                    <span className={styles.timeBadge}>{timeString}</span>
                )}
                <Star className={styles.starIcon} size={18} fill="#fbbf24" />
            </div>

            {/* Center: Logos & VS */}
            <div className={styles.matchup}>
                <div className={styles.teamLogo}>
                    <img src={`https://streamed.pk/api/images/badge/${teams.home.badge}.webp`} alt={teams.home.name} />
                </div>

                <Trophy className={styles.vsIcon} />

                <div className={styles.teamLogo}>
                    <img src={`https://streamed.pk/api/images/badge/${teams.away.badge}.webp`} alt={teams.away.name} />
                </div>
            </div>

            {/* Footer: Match Name */}
            <div className={styles.footer}>
                <div className={styles.matchName}>
                    {teams.home.name} VS {teams.away.name}
                </div>
            </div>
        </Link>
    );
}
