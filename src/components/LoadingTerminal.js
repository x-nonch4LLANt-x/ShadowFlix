"use client";

import React, { useState, useEffect } from "react";
import styles from "./LoadingTerminal.module.css";

const MESSAGES = [
    "Initializing MovieBox protocol...",
    "Scanning mirror hosts...",
    "Bypassing geo-restrictions...",
    "Resolving high-speed streams...",
    "Optimizing buffer...",
    "Access granted."
];

const LoadingTerminal = () => {
    const [lines, setLines] = useState([]);

    useEffect(() => {
        let currentIndex = 0;
        const interval = setInterval(() => {
            if (currentIndex < MESSAGES.length) {
                setLines((prev) => [...prev, MESSAGES[currentIndex]]);
                currentIndex++;
            } else {
                clearInterval(interval);
            }
        }, 800);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className={styles.terminal}>
            {lines.map((line, index) => (
                <div key={index} className={styles.line}>
                    <span className={styles.prompt}>{">"}</span> {line}
                </div>
            ))}
            <div className={styles.cursor} />
        </div>
    );
};

export default LoadingTerminal;
