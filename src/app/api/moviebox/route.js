import { NextResponse } from "next/server";
import { movieBox } from "@/lib/moviebox";

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get("endpoint");
    const query = searchParams.get("query");

    // Cache for 1 hour
    const headers = {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=59",
    };

    try {
        let data;

        if (endpoint === "trending") {
            data = await movieBox.getTrending();
        } else if (endpoint === "movies") {
            data = await movieBox.getMovies();
        } else if (endpoint === "series") {
            data = await movieBox.getSeries();
        } else if (endpoint === "sources") {
            const subjectId = searchParams.get("id");
            const detailPath = searchParams.get("detailPath");
            const season = searchParams.get("season") || 1;
            const episode = searchParams.get("episode") || 1;

            if (!subjectId || !detailPath) {
                return NextResponse.json({ error: "ID and detailPath required" }, { status: 400 });
            }
            data = await movieBox.getSources(subjectId, detailPath, season, episode);
        } else if (endpoint === "details") {
            const subjectId = searchParams.get("id");
            const detailPath = searchParams.get("detailPath");
            if (!detailPath) {
                return NextResponse.json({ error: "detailPath required" }, { status: 400 });
            }
            data = await movieBox.getDetails(subjectId, detailPath);
        } else if (endpoint === "search") {
            if (!query) {
                return NextResponse.json({ error: "Query required for search" }, { status: 400 });
            }
            const page = searchParams.get("page") || 1;
            console.log(`[API] Searching for: ${query}, page: ${page}`);
            data = await movieBox.search(query, page);
            console.log(`[API] Search result count: ${data?.data?.items?.length || 0}`);
        } else if (endpoint === "suggestions") {
            if (!query) {
                return NextResponse.json({ error: "Query required for suggestions" }, { status: 400 });
            }
            data = await movieBox.getSuggestions(query);
        } else {
            return NextResponse.json({ error: "Invalid endpoint" }, { status: 400 });
        }

        return NextResponse.json(data, { headers });
    } catch (error) {
        console.error("MovieBox Route Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
