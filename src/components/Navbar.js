"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Bell, User } from "lucide-react";
import styles from "./Navbar.module.css";

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ""}`}>
            <div className={styles.logo}>
                <Link href="/">SHADOWFLIX</Link>
            </div>
            <div className={styles.links}>
                <Link href="/">Home</Link>
                <Link href="/series">Series</Link>
                <Link href="/movies">Movies</Link>
                <Link href="/new">New & Popular</Link>
            </div>
            <div className={styles.actions}>
                <Link href="/search">
                    <Search className={styles.icon} />
                </Link>
                <Bell className={styles.icon} />
                <User className={styles.icon} />
            </div>
        </nav>
    );
};

export default Navbar;
