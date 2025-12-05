"use client";

import React, { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import VideoPlayer from "@/components/VideoPlayer";
import LoadingTerminal from "@/components/LoadingTerminal";
import { getSources } from "@/lib/api";
import styles from "./page.module.css";

export default function WatchPage({ params }) {
    const { id } = params;
    const searchParams = useSearchParams();
    const season = searchParams.get("season") || 1;
    const episode = searchParams.get("episode") || 1;
    const detailPath = searchParams.get("detailPath");

    const [sources, setSources] = useState(null);
    const [loading, setLoading] = useState(true);
    const playerRef = useRef(null);

    useEffect(() => {
        const fetchSources = async () => {
            if (!detailPath) {
                console.error("No detailPath provided");
                setLoading(false);
                return;
            }
            const data = await getSources(id, detailPath, season, episode);
            // The API wrapper returns the raw response from /subject/play
            // Based on stream.py, it returns a dict with file details.
            // Let's log it to be sure during dev, but assume it has 'list' or 'url'.
            console.log("Sources data:", data);

            // Handle MovieBox response structure: data.data.streams
            const innerData = data.data || data;
            const streams = innerData.streams || innerData.list || (Array.isArray(innerData) ? innerData : [innerData]);

            if (streams && streams.length > 0) {
                setSources(streams);
            } else {
                setSources(null);
            }
            setLoading(false);
        };
        fetchSources();
    }, [id, detailPath, season, episode]);

    const handlePlayerReady = (player) => {
        playerRef.current = player;
        // You can handle player events here, for example:
        player.on("waiting", () => {
            videojs.log("player is waiting");
        });
        player.on("dispose", () => {
            videojs.log("player will dispose");
        });
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <LoadingTerminal />
            </div>
        );
    }
    if (!sources) return <div className={styles.error}>No sources found</div>;

    // Extract the best source (e.g., m3u8 or mp4)
    // Assuming sources structure from moviebox-api wrapper
    // It usually returns a list of dictionaries or a single URL?
    // Let's assume it returns a list of { file: 'url', type: 'video/mp4' }
    // We'll take the first one for now.

    // MOCK LOGIC: If sources is a list, map to video.js format
    // If sources is an object with 'url', use that.
    // MOCK LOGIC: If sources is a list, map to video.js format
    // MovieBox usually returns { path: "url", quality: "720p" } etc.
    // Determine if we have a direct video source or a webpage URL
    const source = sources[0]; // Take the first one
    const sourceUrl = source.url || source.path || source.file;
    const isWebPage = sourceUrl && !sourceUrl.match(/\.(mp4|m3u8|mkv)$/i);

    if (isWebPage) {
        return (
            <div className={styles.container}>
                <iframe
                    src={sourceUrl}
                    className={styles.iframe}
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
            </div>
        );
    }

    let videoJsSources = [];
    if (Array.isArray(sources)) {
        videoJsSources = sources.map(s => {
            const originalUrl = s.url || s.path || s.file;
            // Use proxy for MP4/MKV to handle Referer
            // M3U8 might be tricky if it has relative segments, but let's try proxying the manifest first.
            // For now, assume MP4 needs proxy.
            const isStream = originalUrl.includes(".m3u8");
            const proxyUrl = `/api/proxy?url=${encodeURIComponent(originalUrl)}`;

            return {
                src: proxyUrl,
                type: isStream ? "application/x-mpegURL" : "video/mp4",
                label: s.quality || "Auto"
            };
        }).filter(s => s.src);
    }

    const videoOptions = {
        autoplay: true,
        controls: true,
        responsive: true,
        fluid: true,
        sources: videoJsSources,
        fill: true,
    };

    return (
        <div className={styles.container}>
            <VideoPlayer options={videoOptions} onReady={handlePlayerReady} />
        </div>
    );
}
