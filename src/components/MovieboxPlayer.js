"use client";

import React from "react";
import { ArrowLeft } from "lucide-react";
import styles from "./MovieboxPlayer.module.css";

export default function MovieboxPlayer({ url, onBack }) {
    if (!url) return null;

    return (
        <div className={styles.playerContainer}>
            {/* Back Button Overlay */}
            <div className={styles.topBar}>
                <button className={styles.backBtn} onClick={onBack}>
                    <ArrowLeft size={28} />
                </button>
            </div>

            {/* The Iframe Player */}
            <iframe
                src={url}
                className={styles.iframe}
                allowFullScreen
                allow="autoplay; encrypted-media; picture-in-picture"
                referrerPolicy="no-referrer"
                sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"
            />
        </div>
    );
}
