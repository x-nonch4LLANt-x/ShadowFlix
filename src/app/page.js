"use client";

import React, { useEffect, useState } from "react";
import NewHeroSection from "@/components/NewHeroSection";
import MediaRow from "@/components/MediaRow";
import SportsCard from "@/components/SportsCard";
import { getTrending, getMovies, getSeries, getFestiveContent, getAnimations } from "@/lib/api";
import { FootballService } from "@/services/football";
import styles from "./page.module.css";

export default function Home() {
  const [trending, setTrending] = useState([]);
  const [latestMovies, setLatestMovies] = useState([]);
  const [latestSeries, setLatestSeries] = useState([]);
  const [animations, setAnimations] = useState([]);
  const [festive, setFestive] = useState([]);
  const [footballMatches, setFootballMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trendingData, moviesData, seriesData, festiveData, animationsData, sportsData] = await Promise.all([
          getTrending(),
          getMovies(),
          getSeries(),
          getFestiveContent(),
          getAnimations(),
          FootballService.getFootballMatches()
        ]);

        setTrending(trendingData ? trendingData.slice(0, 30) : []);
        setLatestMovies(moviesData ? moviesData.slice(0, 30) : []);
        setLatestSeries(seriesData ? seriesData.slice(0, 30) : []);
        setFestive(festiveData ? festiveData.slice(0, 30) : []);
        setAnimations(animationsData ? animationsData.slice(0, 30) : []);

        // Filter for upcoming/live matches and limit to 7
        const now = new Date();
        const upcoming = (sportsData || [])
          .filter(m => {
            const matchDate = new Date(m.date);
            // Include live (started recently) or future
            // Let's say if it started within the last 2 hours it's live/recent
            const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
            return matchDate > twoHoursAgo;
          })
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 7);

        setFootballMatches(upcoming);
      } catch (e) {
        console.error("Error fetching home data:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <NewHeroSection />

      <div className={styles.contentRows}>
        {footballMatches.length > 0 && (
          <div className={styles.row}>
            <h2 className={styles.title}>Upcoming Football ⚽</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 px-4 scrollbar-hide">
              {footballMatches.map((match) => (
                <div key={match.id} style={{ minWidth: '300px' }}>
                  <SportsCard match={match} />
                </div>
              ))}
            </div>
          </div>
        )}
        {trending.length > 0 && <MediaRow title="Trending Now 🔥" items={trending} />}
        {latestMovies.length > 0 && <MediaRow title="Latest Movies" items={latestMovies} />}
        {animations.length > 0 && <MediaRow title="Latest Animations" items={animations} />}
        {animations.length > 0 && <MediaRow title="Animated Film" items={animations.filter(i => i.is_movie)} />}
        {latestSeries.length > 0 && <MediaRow title="Latest TV Shows" items={latestSeries} />}
        {festive.length > 0 && <MediaRow title="Best of Festive Holidays" items={festive} />}
      </div>
    </div>
  );
}
