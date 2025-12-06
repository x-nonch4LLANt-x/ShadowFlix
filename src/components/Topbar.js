"use client";

import React, { useState, useEffect } from "react";
import { Search, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import styles from "./Topbar.module.css";

import { getSuggestions } from "@/lib/api";

import { FootballService } from "@/services/football";

export default function Topbar({ onMenuClick }) {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (query.trim().length > 1) {
                const [mediaResults, footballResults] = await Promise.all([
                    getSuggestions(query),
                    FootballService.search(query)
                ]);

                // Format football results to match suggestion structure or distinguish them
                const formattedFootball = footballResults.map(match => ({
                    id: match.id,
                    title: match.title || `${match.teams?.home?.name} vs ${match.teams?.away?.name}`,
                    type: 'football',
                    is_football: true
                }));

                // Combine and limit
                const combined = [...formattedFootball, ...mediaResults].slice(0, 7);
                setSuggestions(combined);
                setShowSuggestions(true);
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }, 300); // 300ms debounce

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            setShowSuggestions(false);
            router.push(`/search?query=${encodeURIComponent(query)}`);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setQuery(suggestion.title);
        setShowSuggestions(false);

        if (suggestion.is_football) {
            router.push(`/watch/football/${suggestion.id}`);
        } else {
            router.push(`/details/${suggestion.id}`);
        }
    };

    return (
        <header className={styles.topbar}>
            <button
                className={styles.menuButton}
                onClick={onMenuClick}
                aria-label="Toggle sidebar"
            >
                <Menu className={styles.menuIcon} />
            </button>

            <div className={styles.searchWrapper}>
                <form onSubmit={handleSearch} className={styles.searchContainer}>
                    <Search className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search movies, series, anime..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => query.length > 1 && setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // Delay to allow click
                        className={styles.searchInput}
                    />
                </form>

                {showSuggestions && suggestions.length > 0 && (
                    <div className={styles.suggestionsDropdown}>
                        {suggestions.map((item) => (
                            <div
                                key={item.id}
                                className={styles.suggestionItem}
                                onClick={() => handleSuggestionClick(item)}
                            >
                                <Search size={14} className={styles.suggestionIcon} />
                                <span className={styles.suggestionText}>
                                    {item.title}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </header>
    );
}
