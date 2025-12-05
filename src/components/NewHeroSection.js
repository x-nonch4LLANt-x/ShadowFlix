"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Star, Play, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { searchContent } from "@/lib/api";
import styles from "./NewHeroSection.module.css";

const FEATURED_TITLES = [
    { title: "Kpop Demon Hunter", color: "#d946ef", year: 2024 }, // Fallback year
    { title: "Mufasa: The Lion King", color: "#eab308", year: 2024 },
    { title: "The Family Plan", color: "#3b82f6", year: 2023 },
    { title: "The Bad Guys 2", color: "#f97316", year: 2025 },
    { title: "Red One", color: "#ef4444", year: 2024 }
];

const SIDE_TITLES = [
    { title: "Zootopia 2", category: "Animation", color: "#a855f7" },
    { title: "Tron: Ares", category: "Movie", color: "#06b6d4" },
    { title: "Fatal Seduction", category: "Series", color: "#ec4899" }
];

const NewHeroSection = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [featuredMovies, setFeaturedMovies] = useState([]);
    const [sideList, setSideList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            // Fetch Featured Movies
            const featuredPromises = FEATURED_TITLES.map(async (item) => {
                const results = await searchContent(item.title);
                const data = results?.[0] || {};
                return {
                    ...item,
                    id: data.id || item.id, // Ensure ID is present
                    title: data.title || data.name || item.title,
                    description: data.overview || "No description available.",
                    rating: data.vote_average ? data.vote_average.toFixed(1) : "N/A",
                    image: data.backdrop_path ? `https://image.tmdb.org/t/p/original${data.backdrop_path}` : null,
                    year: data.release_date ? new Date(data.release_date).getFullYear() : item.year,
                    detailPath: data.detailPath || ""
                };
            });

            // Fetch Side List
            const sidePromises = SIDE_TITLES.map(async (item) => {
                const results = await searchContent(item.title);
                const data = results?.[0] || {};
                return {
                    ...item,
                    id: data.id || Math.random(),
                    title: data.title || data.name || item.title,
                    rating: data.vote_average ? data.vote_average.toFixed(1) : "N/A",
                    ep: "HD", // Placeholder
                    image: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : null
                };
            });

            const [featured, side] = await Promise.all([
                Promise.all(featuredPromises),
                Promise.all(sidePromises)
            ]);

            setFeaturedMovies(featured);
            setSideList(side);
            setLoading(false);
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (featuredMovies.length === 0) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % featuredMovies.length);
        }, 6000);
        return () => clearInterval(interval);
    }, [featuredMovies]);

    if (loading || featuredMovies.length === 0) return null;

    const currentMovie = featuredMovies[currentIndex];

    return (
        <div className={styles.container}>
            {/* Left Slider */}
            <div className={styles.slider}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        className={styles.slideContainer}
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "-100%" }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                    >
                        <div
                            className={styles.slideBackground}
                            style={{ backgroundImage: currentMovie.image ? `url(${currentMovie.image})` : 'none', backgroundColor: '#111' }}
                        >
                            <div className={styles.gradient} />
                        </div>

                        <div className={styles.slideContent}>
                            <h1
                                className={styles.title}
                                style={{ color: currentMovie.color, textShadow: `0 0 20px ${currentMovie.color}80` }}
                            >
                                {currentMovie.title}
                            </h1>

                            <div className={styles.meta}>
                                <span className={styles.rating}>
                                    <Star size={16} fill={currentMovie.color} color={currentMovie.color} /> {currentMovie.rating}
                                </span>
                                <span className={styles.year}>{currentMovie.year}</span>
                                <span className={styles.quality}>HD</span>
                            </div>

                            <p className={styles.description}>{currentMovie.description}</p>

                            <div className={styles.actions}>
                                <Link href={`/watch/${currentMovie.id}?detailPath=${encodeURIComponent(currentMovie.detailPath || "")}&title=${encodeURIComponent(currentMovie.title)}&poster=${encodeURIComponent(currentMovie.image || "")}`}>
                                    <button
                                        className={styles.playButton}
                                        style={{ backgroundColor: currentMovie.color, boxShadow: `0 0 20px ${currentMovie.color}60` }}
                                    >
                                        <Play size={20} fill="currentColor" /> Watch Now
                                    </button>
                                </Link>
                                <Link href={`/details/${currentMovie.id}?detailPath=${encodeURIComponent(currentMovie.detailPath || "")}&title=${encodeURIComponent(currentMovie.title)}&poster=${encodeURIComponent(currentMovie.image || "")}&overview=${encodeURIComponent(currentMovie.description)}`}>
                                    <button className={styles.infoButton}>
                                        <Info size={20} /> More Info
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Indicators */}
                <div className={styles.indicators}>
                    {featuredMovies.map((movie, idx) => (
                        <div
                            key={idx}
                            className={`${styles.indicator} ${idx === currentIndex ? styles.active : ""}`}
                            style={{ backgroundColor: idx === currentIndex ? movie.color : "rgba(255,255,255,0.3)" }}
                            onClick={() => setCurrentIndex(idx)}
                        />
                    ))}
                </div>
            </div>

            {/* Right Side List */}
            <div className={styles.sideList}>
                {sideList.map((item, idx) => (
                    <div
                        key={idx}
                        className={styles.sideItem}
                        style={{ borderColor: `${item.color}40`, '--dynamic-color': item.color }}
                    >
                        <div className={styles.sideImageContainer}>
                            {item.image ? (
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className={styles.sideImage}
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'block';
                                    }}
                                />
                            ) : null}
                            <div
                                className={styles.sideImagePlaceholder}
                                style={{ background: item.color, display: item.image ? 'none' : 'block' }}
                            />
                        </div>
                        <div className={styles.sideContent}>
                            <div className={styles.sideMeta}>
                                <span className={styles.star}><Star size={12} fill={item.color} color={item.color} /> {item.rating}</span>
                                <span className={styles.qualityBadge}>{item.ep}</span>
                            </div>
                            <h3 className={styles.sideTitle}>{item.title}</h3>
                            <p className={styles.sideCategory} style={{ color: `${item.color}cc` }}>{item.category}</p>
                            <button className={styles.sideWatchBtn} style={{ borderColor: item.color, color: item.color }}>
                                <Play size={12} fill={item.color} color={item.color} /> Watch now
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NewHeroSection;
