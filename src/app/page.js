"use client";

import React, { useEffect, useState } from "react";
import NewHeroSection from "@/components/NewHeroSection";
import MediaRow from "@/components/MediaRow";
import SportsCard from "@/components/SportsCard";
import { getTrending, getMovies, getSeries, getFestiveContent, getAnimations } from "@/lib/api";
import { SportsService } from "@/services/sports";
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
          SportsService.getLiveMatches()
        ]);

        setTrending(trendingData ? trendingData.slice(0, 30) : []);
        setLatestMovies(moviesData ? moviesData.slice(0, 30) : []);
        setLatestSeries(seriesData ? seriesData.slice(0, 30) : []);
        setFestive(festiveData ? festiveData.slice(0, 30) : []);
        setAnimations(animationsData ? animationsData.slice(0, 30) : []);
        setFootballMatches(sportsData || []);
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
            <h2 className={styles.title}>Football</h2>
            <div className={styles.footballSection}>
              <div className={styles.datesBlock}>
                DATES
              </div>
              <div className={styles.matchesList}>
                {footballMatches.slice(0, 10).map((match) => (
                  <SportsCard key={match.id} match={match} />
                ))}
              </div>
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
