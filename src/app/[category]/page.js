import React from "react";
import { searchContent } from "@/lib/api";
import MediaGrid from "@/components/MediaGrid";

// Map slugs to search queries and titles
const categoryMap = {
    "anime": { query: "Anime", title: "Top Anime" },
    "animations": { query: "Animation", title: "Top Animations" },
    "cartoon": { query: "Cartoon", title: "Top Cartoons" },
    "cartoon-series": { query: "Cartoon Series", title: "Top Cartoon Series" },
    "sports": { query: "Sports", title: "Top Sports" },
    "christmas": { query: "Christmas", title: "Christmas Specials" },
    "series": { query: "Series", title: "Top Series" },
    "movies": { query: "Movie", title: "Top Movies" },
};

export default async function CategoryPage({ params }) {
    const { category } = params;
    const config = categoryMap[category];

    if (!config) {
        // Handle 404 or unknown category
        return <div style={{ padding: "2rem", color: "#fff" }}>Category not found</div>;
    }

    // Fetch data
    // We might need to fetch multiple pages to get 50 items if the API limits per page
    // Assuming searchContent returns ~20 items, we might need 3 pages.
    const page1 = await searchContent(config.query, 1);
    const page2 = await searchContent(config.query, 2);
    const page3 = await searchContent(config.query, 3);

    const allItems = [...page1, ...page2, ...page3].slice(0, 50);

    return (
        <MediaGrid title={config.title} items={allItems} />
    );
}
