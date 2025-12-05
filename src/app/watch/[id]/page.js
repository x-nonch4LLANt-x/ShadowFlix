"use client";

import React, { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import VideoPlayer from "@/components/VideoPlayer";
import Player from "@/components/Player";
import { MovieboxService } from "@/services/moviebox";
import styles from "./page.module.css";

export default function WatchPage({ params }) {
    const { id } = params;
    const searchParams = useSearchParams();
    const title = searchParams.get("title");
    const year = searchParams.get("year");

    const [sources, setSources] = useState(null);
    const [iframeUrl, setIframeUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const playerRef = useRef(null);

    useEffect(() => {
        const fetchStream = async () => {
            try {
                if (title) {
                    const results = await MovieboxService.search(title);
                    const match = results.find(r => r.title.toLowerCase() === title.toLowerCase()) || results[0];

                    if (match) {
                        // Determine if it's a movie or series (simple heuristic for now, or use data)
                        // For now, assume movie if no season/ep params
                        const isMovie = !searchParams.get("season");
                        const season = isMovie ? 0 : (parseInt(searchParams.get("season")) || 1);
                        const episode = isMovie ? 0 : (parseInt(searchParams.get("episode")) || 1);

                        console.log(`Fetching sources for ${match.title} (ID: ${match.subjectId}, Path: ${match.id}) S${season}E${episode}`);

                        const data = await MovieboxService.getStreamSources(match.subjectId, match.id, season, episode);

                        if (data && data.data && data.data.streams && data.data.streams.length > 0) {
                            setSources(data.data.streams);
                        } else {
                            // Fallback to iframe
                            console.warn("No direct streams found, falling back to iframe");
                            setIframeUrl(MovieboxService.getPlayerUrl(match.id, match.subjectId));
                        }
                    } else {
                        setError("Content not found on streaming server.");
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
    }, [title, year]);

    const handlePlayerReady = (player) => {
        playerRef.current = player;
    };

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

    if (iframeUrl) {
        return (
            <div className="w-full h-screen bg-black flex items-center justify-center p-4">
                <div className="w-full max-w-6xl aspect-video">
                    <Player url={iframeUrl} title={title} />
                </div>
            </div>
        );
    }

    if (sources) {
        // Map sources to Video.js format
        const videoJsSources = sources.map(s => ({
            src: s.url,
            type: "video/mp4", // Assuming MP4 from Moviebox
            label: s.resolutions || "Auto"
        }));

        const videoOptions = {
            autoplay: true,
            controls: true,
            responsive: true,
            fluid: true,
            sources: videoJsSources,
            fill: true,
        };

        return (
            <div className="w-full h-screen bg-black flex items-center justify-center p-4">
                <div className="w-full max-w-6xl aspect-video">
                    <VideoPlayer options={videoOptions} onReady={handlePlayerReady} />
                </div>
            </div>
        );
    }

    return null;
}
