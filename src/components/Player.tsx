"use client";

import React, { useState, useEffect } from "react";

interface PlayerProps {
    url: string;
    title: string;
}

const Player: React.FC<PlayerProps> = ({ url, title }) => {
    const [isLoading, setIsLoading] = useState(true);

    return (
        <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10">
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 z-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                </div>
            )}
            <iframe
                src={url}
                title={`Player for ${title}`}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                onLoad={() => setIsLoading(false)}
            />
        </div>
    );
};

export default Player;
