"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Player from "@/components/Player";
import { MovieboxService } from "@/services/moviebox";
import styles from "./page.module.css";

export default function WatchPage({ params }) {
    const { id } = params;
    const searchParams = useSearchParams();
    const title = searchParams.get("title");
    const year = searchParams.get("year");

    const [playerUrl, setPlayerUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStream = async () => {
            try {
                // If we have a title, search Moviebox to get the fresh ID/Slug
                if (title) {
                    const results = await MovieboxService.search(title);
                    // Match by title
                    const match = results.find(r => r.title.toLowerCase() === title.toLowerCase()) || results[0];

                    if (match) {
                        const url = MovieboxService.getPlayerUrl(match.id, match.subjectId);
                        setPlayerUrl(url);
                    } else {
                        setError("Content not found on streaming server.");
                    }
                } else {
                    // Fallback if we only have ID (assuming it's a Moviebox ID from internal nav)
                    // But usually we pass title now.
                    setError("Invalid content parameters.");
                }
            } catch (e) {
                console.error("Error fetching stream:", e);
                setError("Failed to load stream.");
            } finally {
                setLoading(false);
            }
        };

        fetchStream();
    }, [title, year]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-black">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-black text-white">
                <div className="text-center">
                    <h2 className="text-xl font-bold mb-2">Oops!</h2>
                    <p className="text-gray-400">{error}</p>
                    <button
                        onClick={() => window.history.back()}
                        className="mt-4 px-4 py-2 bg-purple-600 rounded hover:bg-purple-700"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-screen bg-black flex items-center justify-center p-4">
            <div className="w-full max-w-6xl aspect-video">
                <Player url={playerUrl} title={title} />
            </div>
        </div>
    );
}
