"use client";

import React, { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import VideoPlayer from "@/components/VideoPlayer";
import MovieboxPlayer from "@/components/MovieboxPlayer";
import MediaRow from "@/components/MediaRow";
import { MovieboxService } from "@/services/moviebox";
import { getSuggestions, getTrending } from "@/lib/api";


export default function WatchPage({ params }) {
    const { id } = params;
    const searchParams = useSearchParams();
    const title = searchParams.get("title");
    const year = searchParams.get("year");
    const type = searchParams.get("type"); // "sports" or others

    const [sources, setSources] = useState(null);
    const [iframeUrl, setIframeUrl] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const playerRef = useRef(null);

    useEffect(() => {
        const fetchStream = async () => {
            try {
                if (type === "sports") {
                    // Handle Sports Stream
                    const { FootballService } = await import("@/services/football");
                    const match = await FootballService.getMatch(id);

                    if (match) {
                        // Try to get a stream from the available sources
                        if (match.sources && match.sources.length > 0) {
                            const source = match.sources[0];
                            const streams = await FootballService.getStream(source.source, source.id);

                            if (streams && streams.length > 0) {
                                // Prefer embedUrl as per user request ("USE THE ORIGINAL VIDEO PLAYER")
                                const stream = streams[0];
                                if (stream.embedUrl) {
                                    setIframeUrl(stream.embedUrl);
                                    // Clear HLS sources if we are using iframe
                                    setSources([]);
                                } else if (stream.streamUrl) {
                                    setSources([{
                                        url: stream.streamUrl,
                                        type: "application/x-mpegURL",
                                        label: "Auto"
                                    }]);
                                    setIframeUrl(null);
                                } else {
                                    setError("Stream format not supported.");
                                }
                            } else {
                                setError("Stream not available for this match.");
                            }
                        } else {
                            setError("No stream sources available for this match.");
                        }
                    } else {
                        setError("Match not found.");
                    }
                    setLoading(false);
                    return;
                }

                if (title) {
                    // MOVIE/SERIES LOGIC: ALWAYS USE IFRAME (EXACT REPLICA)
                    const results = await MovieboxService.search(title);
                    const match = results.find(r => r.title.toLowerCase() === title.toLowerCase()) || results[0];

                    if (match) {
                        // Construct the exact player URL from moviebox.ph
                        const url = MovieboxService.getPlayerUrl(match.id, match.subjectId);
                        setIframeUrl(url);
                        setSources(null); // Ensure we don't try to use VideoPlayer
                    } else {
                        setError("Content not found on streaming server.");
                    }

                    // Fetch "More Like This" (Suggestions)
                    const suggestionResults = await getSuggestions(title);
                    if (suggestionResults && suggestionResults.length > 0) {
                        setSuggestions(suggestionResults.slice(0, 10));
                    } else {
                        // Fallback to trending if no suggestions
                        const trending = await getTrending();
                        setSuggestions(trending.slice(0, 10));
                    }
                } else {
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
    }, [title, year, id, searchParams, type]);

    const handlePlayerReady = (player) => {
        playerRef.current = player;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#1a1a1a]">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cyan-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#1a1a1a] text-white">
                <div className="text-center">
                    <h2 className="text-xl font-bold mb-2">Oops!</h2>
                    <p className="text-gray-400">{error}</p>
                    <button
                        onClick={() => window.history.back()}
                        className="mt-4 px-4 py-2 bg-cyan-600 rounded hover:bg-cyan-700"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    // === RENDER LOGIC ===

    // 1. SPORTS PLAYER (Legacy Layout)
    if (type === "sports") {
        return (
            <div className="min-h-screen bg-[#1a1a1a] text-white flex flex-col">
                {/* Header */}
                <header className="p-4 bg-black/50 backdrop-blur-md border-b border-white/10 flex items-center gap-4">
                    <button onClick={() => window.history.back()} className="text-gray-400 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                    </button>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                        ShadowFlix Sports
                    </h1>
                </header>

                {/* Main Player Area */}
                <main className="flex-1 flex flex-col items-center p-4 gap-8">
                    <div className="w-full max-w-7xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10 relative">
                        {iframeUrl ? (
                            <iframe
                                src={iframeUrl}
                                className="w-full h-full border-0"
                                allowFullScreen
                                allow="autoplay; encrypted-media"
                            />
                        ) : sources ? (
                            <VideoPlayer
                                options={{
                                    autoplay: true,
                                    controls: false,
                                    responsive: true,
                                    fluid: true,
                                    sources: sources.map(s => ({
                                        src: s.url,
                                        type: "video/mp4",
                                        label: s.resolutions || "Auto"
                                    })),
                                    fill: true,
                                }}
                                onReady={handlePlayerReady}
                                title={title}
                            />
                        ) : (
                            <div className="flex items-center justify-center w-full h-full">
                                <p className="text-gray-400">No stream available</p>
                            </div>
                        )}
                    </div>

                    {/* More Like This Section */}
                    <div className="w-full max-w-7xl">
                        <h2 className="text-2xl font-bold mb-4 text-cyan-400 border-l-4 border-cyan-400 pl-3">
                            More Like This
                        </h2>
                        {suggestions.length > 0 ? (
                            <MediaRow title="" items={suggestions} />
                        ) : (
                            <p className="text-gray-500">No recommendations available.</p>
                        )}
                    </div>
                </main>
            </div>
        );
    }

    // 2. MOVIEBOX PLAYER (Immersive / Full Screen)
    // This renders ONLY the player, covering everything else.
    return (
        <MovieboxPlayer
            url={iframeUrl}
            onBack={() => window.history.back()}
        />
    );
}
