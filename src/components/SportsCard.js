import React from "react";
import Link from "next/link";
import { Play, Trophy, Star } from "lucide-react";
import styles from "./SportsCard.module.css";

export default function SportsCard({ match }) {
    const { id, team1, team2, status, startTime } = match;
    const isLive = status === "Living" || status === "Live";

    // Format time from ISO or timestamp
    const formatTime = (timeStr) => {
        try {
            const date = new Date(Number(timeStr) || timeStr);
            return date.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        } catch {
            return "TBD";
        }
    };

    return (
        <Link href={isLive ? `/watch/${id}?type=sports` : "#"} className={styles.card}>
            {/* Top Bar: Time & Star */}
            <div className={styles.topBar}>
                {isLive ? (
                    <span className={styles.liveBadge}>LIVE</span>
                ) : (
                    <span className={styles.timeBadge}>{formatTime(startTime)}</span>
                )}
                <Star className={styles.starIcon} size={18} fill="#fbbf24" />
            </div>

            {/* Center: Logos & VS */}
            <div className={styles.matchup}>
                <div className={styles.teamLogo}>
                    <img src={team1.avatar} alt={team1.name} />
                </div>

                <Trophy className={styles.vsIcon} />

                <div className={styles.teamLogo}>
                    <img src={team2.avatar} alt={team2.name} />
                </div>
            </div>

            {/* Footer: Match Name */}
            <div className={styles.footer}>
                <div className={styles.matchName}>
                    {team1.name} VS {team2.name}
                </div>
            </div>
        </Link>
    );
}
