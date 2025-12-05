import { NextResponse } from "next/server";

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    if (!url) {
        return new NextResponse("Missing url", { status: 400 });
    }

    try {
        const headers = new Headers();
        headers.set("Referer", "https://h5.aoneroom.com/");
        headers.set("User-Agent", "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36");

        const response = await fetch(url, {
            headers: headers,
        });

        if (!response.ok) {
            return new NextResponse(`Upstream error: ${response.status}`, { status: response.status });
        }

        // Create a new response with the stream
        const newHeaders = new Headers(response.headers);

        // Ensure we pass relevant headers for video playback
        newHeaders.delete("content-encoding"); // Avoid issues with compression
        newHeaders.set("Access-Control-Allow-Origin", "*");

        return new NextResponse(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: newHeaders,
        });
    } catch (error) {
        console.error("Proxy error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
