"use client";

import React from "react";
import styles from "./MovingBackground.module.css";

const MovingBackground = () => {
    return (
        <div className={styles.container}>
            <div className={styles.background}>
                <div className={styles.blob} />
                <div className={styles.blob} />
                <div className={styles.blob} />
            </div>
            <div className={styles.overlay} />
        </div>
    );
};

export default MovingBackground;
