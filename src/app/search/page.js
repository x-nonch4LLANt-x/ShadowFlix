"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { searchContent } from "@/lib/api";
import LoadingTerminal from "@/components/LoadingTerminal";
import styles from "./page.module.css";
import MediaGrid from "@/components/MediaGrid";

function SearchContent() {
    const searchParams = useSearchParams();
    const query = searchParams.get("query");

    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchResults = async () => {
            if (!query) {
                setResults([]);
                return;
            }

            setLoading(true);
            const data = await searchContent(query);
            setResults(data);
            setLoading(false);
        };

        fetchResults();
    }, [query]);

    if (!query) {
        return (
            <div className={styles.container}>
                <div className={styles.placeholder}>
                    <h2>Search for movies, series, and more</h2>
                    <p>Type in the search bar above to find your favorite content.</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className={styles.loading}>
                <LoadingTerminal />
            </div>
        );
    }

    return (
        <MediaGrid title={`Results for "${query}"`} items={results} />
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div className={styles.loading}><LoadingTerminal /></div>}>
            <SearchContent />
        </Suspense>
    );
}
