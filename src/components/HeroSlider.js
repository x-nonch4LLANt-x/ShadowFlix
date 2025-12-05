"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Play, Info } from "lucide-react";
import styles from "./HeroSlider.module.css";

export default function HeroSlider({ items }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (!items || items.length === 0) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % items.length);
        }, 8000);
        return () => clearInterval(interval);
    }, [items]);

    if (!items || items.length === 0) return null;

    const currentItem = items[currentIndex];

    return (
        <div className={styles.heroContainer}>
            {items.map((item, index) => (
                <div
                    key={item.id}
                    className={`${styles.slide} ${index === currentIndex ? styles.active : ""}`}
                    style={{ backgroundImage: `url(${item.cover || item.poster_url})` }}
                >
                    <div className={styles.overlay}></div>
                </div>
            ))}

            <div className={styles.content}>
                <h1 className={styles.title}>{currentItem.title}</h1>
                <div className={styles.meta}>
                    <span className={styles.rating}>{currentItem.rating?.toFixed(1)}</span>
                    <span className={styles.year}>{currentItem.year}</span>
                    <span className={styles.type}>{currentItem.is_movie ? "Movie" : "Series"}</span>
                </div>
                <p className={styles.overview}>{currentItem.overview}</p>

                <div className={styles.actions}>
                    <Link href={`/watch/${currentItem.id}?detailPath=${currentItem.detailPath}`} className={styles.playButton}>
                        <Play className={styles.icon} fill="currentColor" />
                        <span>Watch Now</span>
                    </Link>
                    <Link href={`/details/${currentItem.id}?detailPath=${currentItem.detailPath}`} className={styles.infoButton}>
                        <Info className={styles.icon} />
                        <span>More Info</span>
                    </Link>
                </div>
            </div>

            <div className={styles.indicators}>
                {items.map((_, index) => (
                    <button
                        key={index}
                        className={`${styles.indicator} ${index === currentIndex ? styles.activeIndicator : ""}`}
                        onClick={() => setCurrentIndex(index)}
                    />
                ))}
            </div>
        </div>
    );
}
