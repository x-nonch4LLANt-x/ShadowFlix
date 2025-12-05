"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Film, Tv, Zap, Smile, Gamepad2, Trophy, Gift, Search } from "lucide-react";
import styles from "./Sidebar.module.css";

export default function Sidebar() {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(true); // Default collapsed

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
        <aside
            className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""}`}
            onMouseEnter={() => setIsCollapsed(false)}
            onMouseLeave={() => setIsCollapsed(true)}
        >
            <div className={styles.logoContainer}>
                <h1 className={styles.logo}>{isCollapsed ? "S" : "ShadowFlix"}</h1>
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
                        >
                            <Icon className={styles.icon} />
                            <span className={styles.label}>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
