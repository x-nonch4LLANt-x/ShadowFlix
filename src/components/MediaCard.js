"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, Play } from "lucide-react";
import styles from "./MediaCard.module.css";

const MediaCard = ({ item }) => {
    const title = item.title || item.postTitle || item.name || "Unknown Title";
    const poster = item.poster_url || item.poster || item.cover || item.img;
    const year = item.year || item.releaseDate || "";

    const queryParams = new URLSearchParams({
        detailPath: item.detailPath || "",
        title: title || "",
        poster: poster || "",
        year: year || "",
        rating: item.rating || 0,
        overview: item.overview || "",
        casts: JSON.stringify(item.casts || [])
    }).toString();

    return (
        <Link href={`/details/${item.imdb_id || item.id}?${queryParams}`} className={styles.card}>
            <div className={styles.imageContainer}>
                <Image
                    src={poster}
                    alt={title}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
                    className={styles.image}
                    loading="lazy"
                />
            </div>

            <div className={styles.content}>
                <div className={styles.metaRow}>
                    <div className={styles.rating}>
                        <Star size={12} fill="#00FFFF" color="#00FFFF" />
                        <span>{item.rating ? Number(item.rating).toFixed(1) : "0.0"}</span>
                    </div>
                    <span className={styles.qualityBadge}>HD</span>
                    <span className={styles.year}>{year}</span>
                </div>

                <h3 className={styles.title}>{title}</h3>

                <Link href={`/watch/${item.imdb_id || item.id}?detailPath=${encodeURIComponent(item.detailPath || "")}&title=${encodeURIComponent(title)}&poster=${encodeURIComponent(poster)}`}>
                    <button className={styles.watchBtn}>
                        <Play size={12} fill="currentColor" /> Watch now
                    </button>
                </Link>
            </div>
        </Link>
    );
};

export default MediaCard;
