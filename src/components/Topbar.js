"use client";

import React, { useState, useEffect } from "react";
import { Search, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import styles from "./Topbar.module.css";

import { getSuggestions } from "@/lib/api";

export default function Topbar({ onMenuClick }) {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (query.trim().length > 1) {
                const results = await getSuggestions(query);
                setSuggestions(results.slice(0, 5)); // Limit to 5 suggestions
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
        router.push(`/watch/${suggestion.id}`); // Direct to watch or search? Let's go to search for now or watch if it's a direct hit.
        // Actually, Google autofill usually fills the bar and searches. 
        // But here, if it's a specific movie, maybe go to details?
        // Let's go to details if we have an ID, or search if it's just a keyword.
        // The API returns items with IDs.
        router.push(`/details/${suggestion.id}`);
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
