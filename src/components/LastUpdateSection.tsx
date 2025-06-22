"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import AnimeCard from "./AnimeCard";
import LoadingSpinner from "./LoadingSpinner";
import { ClockIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import apiConfig from "@/config/apiConfig";

interface LastUpdateAnime {
  title: string;
  slug?: string;
  url?: string;
  poster?: string;
  thumb?: string;
  episode?: string;
  latest_episode?: string;
  release_date?: string;
  day?: string;
  time?: string;
}

export default function LastUpdateSection() {
  const [animeList, setAnimeList] = useState<LastUpdateAnime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLastUpdate = async () => {
      try {
        setLoading(true);
        setError(null);

        const apiCall = apiConfig.LASTUPDATE();
        const response = await fetch(apiCall.url, apiCall.options);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Handle different API response structures
        let animeData: LastUpdateAnime[] = [];
        if (data.result && Array.isArray(data.result)) {
          // Handle Maelyn API structure with data.result
          animeData = data.result.map((item: any) => ({
            title: item.judul || item.title,
            slug: item.slug || item.judul?.toLowerCase().replace(/\s+/g, "-"),
            poster: item.thumbnail || item.poster,
            thumb: item.thumbnail || item.thumb,
            episode: item.episode,
            latest_episode: item.episode,
            release_date: item.tanggal || item.release_date,
            day: item.hari || item.day,
            time: item.time,
            url: item.link || item.url,
          }));
        } else if (data.data && Array.isArray(data.data)) {
          animeData = data.data.map((item: any) => ({
            title: item.judul || item.title,
            slug: item.slug || item.judul?.toLowerCase().replace(/\s+/g, "-"),
            poster: item.thumbnail || item.poster,
            thumb: item.thumbnail || item.thumb,
            episode: item.episode,
            latest_episode: item.episode,
            release_date: item.tanggal || item.release_date,
            day: item.hari || item.day,
            time: item.time,
            url: item.link || item.url,
          }));
        } else if (Array.isArray(data)) {
          animeData = data.map((item: any) => ({
            title: item.judul || item.title,
            slug: item.slug || item.judul?.toLowerCase().replace(/\s+/g, "-"),
            poster: item.thumbnail || item.poster,
            thumb: item.thumbnail || item.thumb,
            episode: item.episode,
            latest_episode: item.episode,
            release_date: item.tanggal || item.release_date,
            day: item.hari || item.day,
            time: item.time,
            url: item.link || item.url,
          }));
        } else if (data.results && Array.isArray(data.results)) {
          animeData = data.results.map((item: any) => ({
            title: item.judul || item.title,
            slug: item.slug || item.judul?.toLowerCase().replace(/\s+/g, "-"),
            poster: item.thumbnail || item.poster,
            thumb: item.thumbnail || item.thumb,
            episode: item.episode,
            latest_episode: item.episode,
            release_date: item.tanggal || item.release_date,
            day: item.hari || item.day,
            time: item.time,
            url: item.link || item.url,
          }));
        } else {
          console.warn("Unexpected API response structure:", data);
          // Create mock data for development
          animeData = generateMockData();
        }

        setAnimeList(animeData.slice(0, 12));
      } catch (err) {
        console.error("Error fetching last update:", err);
        setError("Gagal memuat update terbaru");
        // Use mock data as fallback
        setAnimeList(generateMockData());
      } finally {
        setLoading(false);
      }
    };

    fetchLastUpdate();
  }, []);

  // Generate mock data for development/fallback
  const generateMockData = (): LastUpdateAnime[] => {
    const mockAnime = [
      {
        title: "Jujutsu Kaisen Season 2",
        slug: "jujutsu-kaisen-season-2",
        poster: "/placeholder-anime.jpg",
        episode: "23",
        latest_episode: "Episode 23",
        release_date: "2 jam yang lalu",
        day: "Kamis",
        time: "23:00",
      },
      {
        title: "Attack on Titan: The Final Season",
        slug: "attack-on-titan-final-season",
        poster: "/placeholder-anime.jpg",
        episode: "87",
        latest_episode: "Episode 87",
        release_date: "5 jam yang lalu",
        day: "Minggu",
        time: "00:10",
      },
      {
        title: "Demon Slayer: Hashira Training Arc",
        slug: "demon-slayer-hashira-training",
        poster: "/placeholder-anime.jpg",
        episode: "8",
        latest_episode: "Episode 8",
        release_date: "1 hari yang lalu",
        day: "Minggu",
        time: "23:15",
      },
      {
        title: "My Hero Academia Season 7",
        slug: "my-hero-academia-season-7",
        poster: "/placeholder-anime.jpg",
        episode: "20",
        latest_episode: "Episode 20",
        release_date: "1 hari yang lalu",
        day: "Sabtu",
        time: "17:30",
      },
      {
        title: "One Piece",
        slug: "one-piece",
        poster: "/placeholder-anime.jpg",
        episode: "1085",
        latest_episode: "Episode 1085",
        release_date: "2 hari yang lalu",
        day: "Minggu",
        time: "09:30",
      },
      {
        title: "Chainsaw Man",
        slug: "chainsaw-man",
        poster: "/placeholder-anime.jpg",
        episode: "12",
        latest_episode: "Episode 12",
        release_date: "3 hari yang lalu",
        day: "Selasa",
        time: "24:00",
      },
    ];

    return Array.from({ length: 12 }, (_, index) => {
      const base = mockAnime[index % mockAnime.length];
      return {
        ...base,
        title: `${base.title} ${index > 5 ? `Part ${index - 5}` : ""}`.trim(),
      };
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <LoadingSpinner />
        <p className="text-gray-400 mt-4">Memuat update terbaru...</p>
      </div>
    );
  }

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8"
      id="latest"
    >
      {/* Section Header */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-lg">
            <ClockIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Update Terbaru
            </h2>
            <p className="text-gray-400 text-lg">
              Episode anime terbaru yang baru saja dirilis
            </p>
          </div>
        </div>

        <Link
          href="/latest"
          className="flex items-center text-primary-400 hover:text-primary-300 transition-colors duration-200 group"
        >
          <span className="font-semibold mr-2">Lihat Semua</span>
          <ChevronRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
        </Link>
      </motion.div>

      {/* Featured Latest Update */}
      {animeList.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <span className="bg-green-500 text-white px-2 py-1 text-xs font-semibold rounded-full animate-pulse">
                  🔥 TERBARU
                </span>
                <span className="text-green-400 text-sm">
                  {animeList[0].release_date}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-1">
                {animeList[0].title}
              </h3>
              <p className="text-gray-300">
                {animeList[0].latest_episode ||
                  `Episode ${animeList[0].episode}`}{" "}
                baru saja dirilis!
              </p>
            </div>
            <Link
              href={`/anime/${
                animeList[0].url
                  ? encodeURIComponent(animeList[0].url)
                  : animeList[0].slug || ""
              }`}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg flex items-center space-x-2"
            >
              <span>Tonton Sekarang</span>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          </div>
        </motion.div>
      )}

      {/* Anime Grid */}
      {animeList.length > 0 ? (
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6"
          variants={containerVariants}
        >
          {animeList.map((anime, index) => (
            <motion.div
              key={anime.slug || anime.url || index}
              variants={{
                hidden: { opacity: 0, y: 50 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.5,
                    delay: index * 0.1,
                  },
                },
              }}
            >
              <AnimeCard
                anime={{
                  ...anime,
                  status: "Latest Update",
                }}
                index={index}
                variant="default"
              />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-16">
          <div className="text-gray-400">
            <ClockIcon className="w-16 h-16 mx-auto mb-4" />
            <p className="text-lg font-semibold">Belum ada update terbaru</p>
            <p className="text-gray-500 mt-2">
              Cek kembali nanti untuk episode terbaru
            </p>
          </div>
        </div>
      )}

      {/* Show error message if there's an error but we have fallback data */}
      {error && animeList.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mt-4"
        >
          <p className="text-yellow-400 text-sm">
            ⚠️ Menampilkan data contoh karena gagal memuat dari server
          </p>
        </motion.div>
      )}
    </motion.section>
  );
}
