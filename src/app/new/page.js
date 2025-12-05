"use client";

import React, { useEffect, useState } from "react";
import { getTrending } from "@/lib/api";
import MediaGrid from "@/components/MediaGrid";

export default function NewPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const data = await getTrending();
            let allItems = [];
            if (Array.isArray(data)) {
                allItems = data;
            } else if (data && Array.isArray(data.list)) {
                allItems = data.list;
            } else if (data && Array.isArray(data.results)) {
                allItems = data.results;
            }

            setItems(allItems);
            setLoading(false);
        };
        fetchData();
    }, []);

    if (loading) return <div style={{ padding: "2rem", color: "#fff" }}>Loading New & Popular...</div>;

    return (
        <MediaGrid title="New & Popular" items={items} />
    );
}
