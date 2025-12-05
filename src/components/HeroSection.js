```javascript
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Play, Info, Star } from "lucide-react";
import styles from "./HeroSection.module.css";

const HeroSection = ({ items }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto-slide effect
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % items.length);
        }, 8000);
        return () => clearInterval(interval);
    }, [items.length]);

    if (!items || items.length === 0) return null;

    const currentItem = items[currentIndex];
    // Get next 3 items for the side list
    const nextItems = [
        items[(currentIndex + 1) % items.length],
        items[(currentIndex + 2) % items.length],
        items[(currentIndex + 3) % items.length]
    ];

    return (
        <div className={styles.heroContainer}>
            {/* Background Image (Blurred/Dimmed) */}
            <div className={styles.heroBackground} style={{backgroundImage: `url(${ currentItem.poster })`}}></div>
            <div className={styles.heroOverlay}></div>

            <div className={styles.contentWrapper}>
                {/* Left: Featured Item */}
                <div className={styles.featuredSection}>
                    <div className={styles.featuredContent}>
                        <h1 className={styles.featuredTitle}>{currentItem.title}</h1>
                        
                        <div className={styles.featuredMeta}>
                            <span className={styles.rating}><Star size={16} fill="#00FFFF" color="#00FFFF"/> {currentItem.rating || "0.0"}</span>
                            <span className={styles.qualityBadge}>HD</span>
                            <span className={styles.year}>{currentItem.year}</span>
                        </div>

                        <p className={styles.featuredOverview}>
                            {currentItem.overview ? currentItem.overview.substring(0, 150) + "..." : "No description available."}
                        </p>

                        <div className={styles.actionButtons}>
                             <Link href={`/ details / ${ currentItem.imdb_id || currentItem.id }?detailPath = ${ currentItem.detailPath } `} className={styles.playButton}>
                                <div className={styles.playIconCircle}>
                                    <Play size={24} fill="currentColor" className={styles.playIcon} />
                                </div>
                                <div className={styles.playText}>
                                    <span className={styles.playTitle}>{currentItem.title}</span>
                                    <span className={styles.playSubtitle}>Watch now</span>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Right: Side List */}
                <div className={styles.sideListSection}>
                    {nextItems.map((item, index) => (
                        <Link key={index} href={`/ details / ${ item.imdb_id || item.id }?detailPath = ${ item.detailPath } `} className={styles.sideItem}>
                            <div className={styles.sideImageContainer}>
                                <img src={item.poster} alt={item.title} className={styles.sideImage} />
                            </div>
                            <div className={styles.sideContent}>
                                <div className={styles.sideMeta}>
                                    <span className={styles.sideRating}><Star size={10} fill="#00FFFF" color="#00FFFF"/> {item.rating || "0.0"}</span>
                                    <span className={styles.sideQuality}>HD</span>
                                </div>
                                <h4 className={styles.sideTitle}>{item.title}</h4>
                                <button className={styles.sideWatchBtn}>
                                    <Play size={10} fill="currentColor" /> Watch now
                                </button>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HeroSection;
```
