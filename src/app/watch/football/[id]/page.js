"use client";

import React, { useEffect, useState } from "react";
import { FootballService } from "@/services/football";

export default function FootballWatchPage({ params }) {
    const { id } = params;
    const [match, setMatch] = useState(null);
    const [iframeUrl, setIframeUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const matchData = await FootballService.getMatch(id);
                if (!matchData) {
                    setError("Match not found.");
                    setLoading(false);
                    return;
                }
                setMatch(matchData);

                if (matchData.sources && matchData.sources.length > 0) {
                    const source = matchData.sources[0];
                    const streams = await FootballService.getStream(source.source, source.id);

                    if (streams && streams.length > 0) {
                        const stream = streams[0];
                        if (stream.embedUrl) {
                            setIframeUrl(stream.embedUrl);
                        } else {
                            setError("Stream format not supported (only embedUrl supported).");
                        }
                    } else {
                        setError("Stream not available for this match.");
                    }
                } else {
                    setError("No stream sources available.");
                }
            } catch (err) {
                console.error("Error fetching match data:", err);
                setError("Failed to load match data.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

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

    return (
        <div className="min-h-screen bg-[#1a1a1a] text-white flex flex-col">
            {/* Header */}
            <header className="p-4 bg-black/50 backdrop-blur-md border-b border-white/10 flex items-center gap-4">
                <button onClick={() => window.history.back()} className="text-gray-400 hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                </button>
                <h1 className="text-xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                    Football Live
                </h1>
                {match && (
                    <span className="text-gray-300 ml-4 hidden md:inline">
                        {match.title}
                    </span>
                )}
            </header>

            {/* Main Player Area */}
            <main className="flex-1 flex flex-col items-center p-4 gap-8">
                <div className="w-full max-w-7xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10 relative">
                    {iframeUrl ? (
                        <iframe
                            src={iframeUrl}
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            allowFullScreen
                            allow="encrypted-media; autoplay"
                            className="w-full h-full"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            No stream loaded.
                        </div>
                    )}
                </div>

                {match && (
                    <div className="w-full max-w-7xl text-center md:text-left">
                        <h2 className="text-2xl font-bold text-white mb-2">{match.title}</h2>
                        <p className="text-gray-400">
                            {new Date(match.date).toLocaleString()}
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}
