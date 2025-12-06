"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Film, Tv, Zap, Smile, Gamepad2, Trophy, Gift, X } from "lucide-react";
import styles from "./Sidebar.module.css";

export default function Sidebar({ isOpen, onToggle }) {
    const pathname = usePathname();

    const navItems = [
        { name: "Home", icon: Home, href: "/" },
        { name: "Movies", icon: Film, href: "/movies" },
        { name: "Series", icon: Tv, href: "/series" },
        { name: "Anime", icon: Zap, href: "/anime" },
        { name: "Animations", icon: Smile, href: "/animations" },
        { name: "Cartoons", icon: Gamepad2, href: "/cartoon" },
        { name: "Cartoon Series", icon: Tv, href: "/cartoon-series" },
        { name: "Sports", icon: Trophy, href: "/sports" },
        { name: "Christmas", icon: Gift, href: "/christmas" },
    ];

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    className={styles.overlay}
                    onClick={onToggle}
                />
            )}

            {/* Sidebar */}
            <aside className={`${styles.sidebar} ${!isOpen ? styles.closed : ""}`}>
                <div className={styles.header}>
                    <h1 className={styles.logo}>ShadowFlix</h1>
                    <button
                        className={styles.closeButton}
                        onClick={onToggle}
                        aria-label="Close sidebar"
                    >
                        <X className={styles.closeIcon} />
                    </button>
                </div>

                <nav className={styles.nav}>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`${styles.navItem} ${isActive ? styles.active : ""}`}
                                onClick={onToggle}
                            >
                                <Icon className={styles.icon} />
                                <span className={styles.label}>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            </aside>
        </>
    );
}
