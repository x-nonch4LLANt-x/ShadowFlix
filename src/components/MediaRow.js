"use client";

import React from "react";
import MediaCard from "./MediaCard";
import styles from "./MediaRow.module.css";

const MediaRow = ({ title, items }) => {
    if (!items || items.length === 0) return null;

    return (
        <div className={styles.row}>
            <h2 className={styles.title}>{title}</h2>
            <div className={styles.list}>
                {items.map((item, index) => (
                    <MediaCard key={item.imdb_id || index} item={item} />
                ))}
            </div>
        </div>
    );
};

export default MediaRow;
