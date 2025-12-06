"use client";

import React, { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import { Play, Pause, RotateCcw, RotateCw, Settings, Maximize, Captions, Square } from "lucide-react";
import styles from "./VideoPlayer.module.css";

export default function VideoPlayer({ options, onReady, title }) {
    const videoRef = useRef(null);
    const playerRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [showOverlay, setShowOverlay] = useState(true);
    const overlayTimeoutRef = useRef(null);
    const [isPiP, setIsPiP] = useState(false);

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        if (h > 0) {
            return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleMouseMove = () => {
        setShowOverlay(true);
        if (overlayTimeoutRef.current) clearTimeout(overlayTimeoutRef.current);
        if (isPlaying) {
            overlayTimeoutRef.current = setTimeout(() => setShowOverlay(false), 3000);
        }
    };

    useEffect(() => {
        if (!playerRef.current) {
            const videoElement = document.createElement("video-js");
            videoElement.classList.add("vjs-big-play-centered");
            videoElement.style.width = "100%";
            videoElement.style.height = "100%";
            videoRef.current.appendChild(videoElement);

            // Force controls off for custom UI
            const playerOptions = { ...options, controls: false, autoplay: false }; // Ensure autoplay is false initially

            const player = (playerRef.current = videojs(videoElement, playerOptions, () => {
                videojs.log("player is ready");

                console.log("=== VideoPlayer: Player Ready ===");
                console.log("Sources:", playerOptions.sources);

                // Default state: Unmuted and Paused
                player.muted(false);
                player.volume(1.0);
                player.pause(); // Explicitly pause
                setIsPlaying(false);

                onReady && onReady(player);
            }));

            // Event Listeners
            player.on("play", () => {
                setIsPlaying(true);
                handleMouseMove();
            });
            player.on("pause", () => setIsPlaying(false));
            player.on("timeupdate", () => setCurrentTime(player.currentTime()));
            player.on("loadedmetadata", () => setDuration(player.duration()));
            player.on("durationchange", () => setDuration(player.duration()));

            // PiP Event Listeners
            player.on('enterpictureinpicture', () => setIsPiP(true));
            player.on('leavepictureinpicture', () => setIsPiP(false));

            // Error handling
            player.on("error", (e) => {
                const error = player.error();
                console.error("=== VideoPlayer Error ===");
                console.error("Error code:", error?.code);
                console.error("Error message:", error?.message);
                console.error("Current source:", player.currentSource());
                console.error("All sources:", playerOptions.sources);
            });

            // Log when source is loaded
            player.on("loadstart", () => {
                console.log("=== VideoPlayer: Loading Started ===");
                console.log("Current source:", player.currentSource());
            });

            player.on("loadeddata", () => {
                console.log("=== VideoPlayer: Data Loaded ===");
            });
        } else {
            const player = playerRef.current;
            // Update sources if they change
            if (options.sources) {
                player.src(options.sources);
            }
        }
    }, [options, videoRef]);

    useEffect(() => {
        const player = playerRef.current;
        return () => {
            if (player && !player.isDisposed()) {
                player.dispose();
                playerRef.current = null;
            }
        };
    }, [playerRef]);

    // Control Handlers
    const togglePlay = () => {
        if (playerRef.current) {
            if (isPlaying) playerRef.current.pause();
            else playerRef.current.play();
        }
    };

    const seek = (seconds) => {
        if (playerRef.current) {
            const newTime = playerRef.current.currentTime() + seconds;
            playerRef.current.currentTime(newTime);
        }
    };

    const handleSeek = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        if (playerRef.current) {
            playerRef.current.currentTime(percent * duration);
        }
    };

    const toggleFullscreen = () => {
        if (playerRef.current) {
            if (playerRef.current.isFullscreen()) playerRef.current.exitFullscreen();
            else playerRef.current.requestFullscreen();
        }
    };

    const togglePiP = () => {
        if (playerRef.current) {
            if (document.pictureInPictureElement) {
                document.exitPictureInPicture();
            } else if (playerRef.current.isInPictureInPicture()) {
                playerRef.current.exitPictureInPicture();
            } else {
                playerRef.current.requestPictureInPicture();
            }
        }
    };

    return (
        <div
            className={styles.videoWrapper}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => isPlaying && setShowOverlay(false)}
        >
            <div data-vjs-player style={{ width: "100%", height: "100%" }}>
                <div ref={videoRef} style={{ width: "100%", height: "100%" }} />
            </div>

            {/* Custom Overlay */}
            <div className={`${styles.overlay} ${showOverlay ? styles.visible : ''}`} style={{ opacity: showOverlay ? 1 : 0 }}>
                {/* Top Bar */}
                <div className={styles.topBar}>
                    <h2 className={styles.videoTitle}>{title || "{SHOW NAME}"}</h2>
                </div>

                {/* Center Controls */}
                <div className={styles.centerControls}>
                    <button className={`${styles.controlBtn} ${styles.seekBtn}`} onClick={() => seek(-10)}>
                        <RotateCcw size={40} strokeWidth={1.5} />
                    </button>

                    <button className={`${styles.controlBtn} ${styles.playPauseBtn}`} onClick={togglePlay}>
                        {isPlaying ? (
                            <Pause size={60} fill="currentColor" stroke="none" />
                        ) : (
                            <Play size={60} fill="currentColor" stroke="none" />
                        )}
                    </button>

                    <button className={`${styles.controlBtn} ${styles.seekBtn}`} onClick={() => seek(10)}>
                        <RotateCw size={40} strokeWidth={1.5} />
                    </button>
                </div>

                {/* Bottom Controls */}
                <div className={styles.bottomControls}>
                    {/* Time Display Above Progress Bar */}
                    <div className={styles.timeDisplay}>
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className={styles.progressContainer} onClick={handleSeek}>
                        <div
                            className={styles.progressBar}
                            style={{ width: `${(currentTime / duration) * 100}%` }}
                        >
                            <div className={styles.scrubber}></div>
                        </div>
                    </div>

                    {/* Actions Row Below Progress Bar */}
                    <div className={styles.actionsRow}>
                        <div className={styles.leftActions}>
                            <button className={styles.actionBtn}>
                                <Captions size={20} />
                                <span>CC : ENGLISH</span>
                            </button>
                        </div>

                        <div className={styles.rightActions}>
                            <span className={`${styles.actionBtn} ${styles.qualityBadge}`}>1080P</span>
                            <button className={styles.actionBtn}>
                                <Settings size={20} />
                            </button>
                            <button className={styles.actionBtn} onClick={togglePiP}>
                                <Square size={20} />
                            </button>
                            <button className={styles.actionBtn} onClick={toggleFullscreen}>
                                <Maximize size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
