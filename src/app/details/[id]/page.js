"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Play, Star, Calendar, Clock, Share2, Facebook, Twitter, Linkedin, Youtube, MessageCircle, ChevronRight } from "lucide-react";
import { TmdbService } from "@/services/tmdb";
import { MovieboxService } from "@/services/moviebox";
import MediaCard from "@/components/MediaCard";
import Player from "@/components/Player";
import styles from "./page.module.css";

export default function DetailsPage({ params }) {
    const { id } = params;
    const searchParamsHook = require("next/navigation").useSearchParams();

    // Optimistic Data from URL
    const detailPath = searchParamsHook.get("detailPath");
    const initialTitle = searchParamsHook.get("title");
    const initialPoster = searchParamsHook.get("poster");
    const initialYear = searchParamsHook.get("year");
    const initialRating = searchParamsHook.get("rating");

    const [item, setItem] = useState(initialTitle ? {
        title: initialTitle,
        poster: initialPoster,
        year: initialYear,
        rating: initialRating,
        overview: "",
        id: id
    } : null);

    const [tmdbData, setTmdbData] = useState(null);
    const [similarItems, setSimilarItems] = useState([]);
    const [loading, setLoading] = useState(!initialTitle);
    const [activeTab, setActiveTab] = useState("cast"); // cast, episodes
    const [playerUrl, setPlayerUrl] = useState(null);
    const [isPlayerLoading, setIsPlayerLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            // 1. Fetch TMDb details based on title (or ID if we had it)
            // Since we rely on Moviebox ID, we search TMDB by title
            let currentItem = item;

            // If we don't have an item yet (direct navigation), try to reconstruct or fetch basic info
            if (!currentItem && initialTitle) {
                currentItem = { title: initialTitle, year: initialYear, id };
                setItem(currentItem);
            }

            if (currentItem?.title) {
                // Search TMDB to get metadata
                const searchRes = await TmdbService.search(currentItem.title);
                const tmdbMatch = searchRes.find(r =>
                    r.title === currentItem.title ||
                    (r.release_date && r.release_date.startsWith(currentItem.year))
                ) || searchRes[0];

                if (tmdbMatch) {
                    const details = await TmdbService.getDetails(tmdbMatch.id, tmdbMatch.media_type || "movie");
                    setTmdbData(details);

                    // Update item with better data
                    setItem(prev => ({
                        ...prev,
                        poster: details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : prev?.poster,
                        rating: details.vote_average?.toFixed(1) || prev?.rating,
                        overview: details.overview || prev?.overview,
                        year: details.release_date ? details.release_date.split("-")[0] : prev?.year,
                        backdrop: details.backdrop_path ? `https://image.tmdb.org/t/p/original${details.backdrop_path}` : null
                    }));

                    // Similar items
                    if (details.recommendations?.results) {
                        setSimilarItems(details.recommendations.results.slice(0, 4).map(r => ({
                            id: r.id,
                            title: r.title || r.name,
                            poster: r.poster_path ? `https://image.tmdb.org/t/p/w342${r.poster_path}` : null,
                            rating: r.vote_average,
                            year: r.release_date ? r.release_date.split("-")[0] : ""
                        })));
                    }
                }
            }
            setLoading(false);
        };

        fetchData();
    }, [id, initialTitle]);

    const handleWatch = async () => {
        setIsPlayerLoading(true);
        // Use MovieboxService to find the stream
        // We need to search Moviebox again to get the exact slug and ID if we don't have them perfectly
        // But usually 'id' param in URL is the Moviebox ID if navigated from search

        // If 'id' is a number (TMDB ID), we need to search Moviebox
        // If 'id' is a string (Moviebox ID), we might be good

        // Let's assume we search by title to be safe and get the fresh link
        if (item?.title) {
            const mbResults = await MovieboxService.search(item.title);
            const match = mbResults.find(r => r.title.toLowerCase() === item.title.toLowerCase()) || mbResults[0];

            if (match) {
                const url = MovieboxService.getPlayerUrl(match.id, match.subjectId);
                setPlayerUrl(url);
            } else {
                alert("Stream not found on Moviebox.");
            }
        }
        setIsPlayerLoading(false);
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen text-white">Loading...</div>;
    }

    if (!item) return <div className="flex items-center justify-center min-h-screen text-white">Content not found</div>;

    return (
        <div className={styles.container}>
            {/* Backdrop */}
            <div className={styles.backdrop} style={{ backgroundImage: `url(${item.backdrop || item.poster})` }}>
                <div className={styles.backdropOverlay}></div>
            </div>

            <div className={styles.contentWrapper}>
                {/* Player Overlay or Poster */}
                {playerUrl ? (
                    <div className="w-full max-w-5xl mx-auto mb-8 z-20 relative">
                        <Player url={playerUrl} title={item.title} />
                        <button
                            onClick={() => setPlayerUrl(null)}
                            className="mt-4 px-4 py-2 bg-red-600 rounded text-white hover:bg-red-700 transition"
                        >
                            Close Player
                        </button>
                    </div>
                ) : (
                    <div className={styles.headerContent}>
                        <div className={styles.posterSection}>
                            <img src={item.poster} alt={item.title} className={styles.poster} />
                        </div>

                        <div className={styles.infoSection}>
                            <h1 className={styles.title}>{item.title}</h1>

                            <div className={styles.metaRow}>
                                <span className={styles.qualityTag}>HD</span>
                                <span className={styles.year}>{item.year}</span>
                                <span className={styles.metaDivider}>|</span>
                                <span className={styles.duration}>{tmdbData?.runtime ? `${tmdbData.runtime} min` : "Unknown"}</span>
                                <span className={styles.metaDivider}>|</span>
                                <span>{tmdbData?.genres?.map(g => g.name).join(", ") || "Action, Drama"}</span>
                            </div>

                            <div className={styles.serverRow}>
                                <button
                                    onClick={handleWatch}
                                    disabled={isPlayerLoading}
                                    className={styles.serverBtn}
                                >
                                    {isPlayerLoading ? "Loading..." : <><Play fill="currentColor" size={16} /> Watch Online</>}
                                </button>
                            </div>

                            <p className={styles.description}>
                                {item.overview || "No description available."}
                            </p>

                            <div className={styles.metaDetails}>
                                <p><strong>Country:</strong> {tmdbData?.production_countries?.[0]?.name || "United States"}</p>
                                <p><strong>Production:</strong> {tmdbData?.production_companies?.[0]?.name || "N/A"}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Tabs Navigation */}
            <div className={styles.tabsContainer}>
                <button
                    className={`${styles.tab} ${activeTab === "cast" ? styles.activeTab : ""}`}
                    onClick={() => setActiveTab("cast")}
                >
                    Top Cast
                </button>
            </div>

            {/* Main Content Area */}
            <div className={styles.mainContent}>
                {activeTab === "cast" && (
                    <div className={styles.tabContent}>
                        <div className={styles.castGrid}>
                            {(tmdbData?.credits?.cast || []).slice(0, 12).map((actor) => (
                                <div key={actor.id} className={styles.castCard}>
                                    <img
                                        src={actor.profile_path ? `https://image.tmdb.org/t/p/w200${actor.profile_path}` : "https://via.placeholder.com/200x300?text=No+Image"}
                                        alt={actor.name}
                                        className={styles.castImg}
                                    />
                                    <p className={styles.actorName}>{actor.name}</p>
                                    <p className={styles.characterRole}>{actor.character}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* More Like This */}
            <div className={styles.similarSection}>
                <h3 className={styles.sectionTitle}>You may also like</h3>
                <div className={styles.similarGrid}>
                    {similarItems.map((item) => (
                        <MediaCard key={item.id} item={item} />
                    ))}
                </div>
            </div>
        </div>
    );
}

