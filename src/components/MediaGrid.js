"use client";

import React from "react";
import MediaCard from "./MediaCard";
import styles from "./MediaGrid.module.css";

const MediaGrid = ({ title, items }) => {
    if (!items || items.length === 0) {
        return (
            <div className={styles.container}>
                <h1 className={styles.title}>{title}</h1>
                <div className={styles.empty}>No items found.</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>{title}</h1>
            <div className={styles.grid}>
                {items.map((item, index) => (
                    <MediaCard key={item.id || index} item={item} />
                ))}
            </div>
        </div>
    );
};

export default MediaGrid;
