"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import AnimeCard from "@/components/AnimeCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { FilmIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import apiConfig from "@/config/apiConfig";
import { Metadata } from "next";

interface OngoingAnime {
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
  status?: string;
  genre?: string[];
  rating?: string;
  year?: string;
  synopsis?: string;
}

export default function OngoingPage() {
  const [animeList, setAnimeList] = useState<OngoingAnime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOngoing = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("Fetching ongoing anime data...");

        // Since ONGOING API is not available, use LASTUPDATE API as data source
        const apiCall = apiConfig.LASTUPDATE();
        console.log("API Call (using lastupdate):", apiCall);

        const response = await fetch(apiCall.url, apiCall.options);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("API Response:", data);

        // Handle different API response structures
        let animeData: OngoingAnime[] = [];

        if (
          data.status === "Success" &&
          data.result &&
          Array.isArray(data.result)
        ) {
          // Handle Maelyn API structure with data.result
          animeData = data.result.map((item: any) => ({
            title: item.judul || item.title || "Unknown Title",
            slug:
              item.slug || item.judul?.toLowerCase().replace(/\s+/g, "-") || "",
            poster: item.thumbnail || item.poster || "/placeholder-anime.jpg",
            thumb: item.thumbnail || item.thumb || "/placeholder-anime.jpg",
            episode: item.episode || "TBA",
            latest_episode: item.episode || "TBA",
            release_date: item.tanggal || item.release_date || "TBA",
            day: item.hari || item.day || "TBA",
            time: item.time || "TBA",
            url: item.link || item.url || "",
            status: "Ongoing",
            genre: item.genre || [],
            rating: item.rating || "N/A",
            year: item.year || "2024",
            synopsis: item.synopsis || "Deskripsi tidak tersedia",
          }));
        } else if (data.data && Array.isArray(data.data)) {
          animeData = data.data.map((item: any) => ({
            title: item.judul || item.title || "Unknown Title",
            slug:
              item.slug || item.judul?.toLowerCase().replace(/\s+/g, "-") || "",
            poster: item.thumbnail || item.poster || "/placeholder-anime.jpg",
            thumb: item.thumbnail || item.thumb || "/placeholder-anime.jpg",
            episode: item.episode || "TBA",
            latest_episode: item.episode || "TBA",
            release_date: item.tanggal || item.release_date || "TBA",
            day: item.hari || item.day || "TBA",
            time: item.time || "TBA",
            url: item.link || item.url || "",
            status: "Ongoing",
            genre: item.genre || [],
            rating: item.rating || "N/A",
            year: item.year || "2024",
            synopsis: item.synopsis || "Deskripsi tidak tersedia",
          }));
        } else if (Array.isArray(data)) {
          animeData = data.map((item: any) => ({
            title: item.judul || item.title || "Unknown Title",
            slug:
              item.slug || item.judul?.toLowerCase().replace(/\s+/g, "-") || "",
            poster: item.thumbnail || item.poster || "/placeholder-anime.jpg",
            thumb: item.thumbnail || item.thumb || "/placeholder-anime.jpg",
            episode: item.episode || "TBA",
            latest_episode: item.episode || "TBA",
            release_date: item.tanggal || item.release_date || "TBA",
            day: item.hari || item.day || "TBA",
            time: item.time || "TBA",
            url: item.link || item.url || "",
            status: "Ongoing",
            genre: item.genre || [],
            rating: item.rating || "N/A",
            year: item.year || "2024",
            synopsis: item.synopsis || "Deskripsi tidak tersedia",
          }));
        } else if (data.results && Array.isArray(data.results)) {
          animeData = data.results.map((item: any) => ({
            title: item.judul || item.title || "Unknown Title",
            slug:
              item.slug || item.judul?.toLowerCase().replace(/\s+/g, "-") || "",
            poster: item.thumbnail || item.poster || "/placeholder-anime.jpg",
            thumb: item.thumbnail || item.thumb || "/placeholder-anime.jpg",
            episode: item.episode || "TBA",
            latest_episode: item.episode || "TBA",
            release_date: item.tanggal || item.release_date || "TBA",
            day: item.hari || item.day || "TBA",
            time: item.time || "TBA",
            url: item.link || item.url || "",
            status: "Ongoing",
            genre: item.genre || [],
            rating: item.rating || "N/A",
            year: item.year || "2024",
            synopsis: item.synopsis || "Deskripsi tidak tersedia",
          }));
        } else {
          console.warn("Unexpected API response structure:", data);
          // Create mock data for development
          animeData = generateMockData();
        }

        console.log("Processed anime data:", animeData);
        setAnimeList(animeData);
      } catch (err) {
        console.error("Error fetching ongoing anime:", err);
        setError("Gagal memuat data anime terbaru");
        // Use mock data as fallback
        setAnimeList(generateMockData());
      } finally {
        setLoading(false);
      }
    };

    fetchOngoing();
  }, []);

  // Generate mock data for development/fallback
  const generateMockData = (): OngoingAnime[] => {
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
        status: "Ongoing",
        genre: ["Action", "Supernatural"],
        rating: "8.9",
        year: "2023",
        synopsis:
          "Kelanjutan dari petualangan Yuji Itadori dan teman-temannya.",
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
        status: "Ongoing",
        genre: ["Action", "Drama"],
        rating: "9.0",
        year: "2023",
        synopsis: "Pertarungan terakhir melawan para titan.",
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
        status: "Ongoing",
        genre: ["Action", "Historical"],
        rating: "8.7",
        year: "2024",
        synopsis: "Tanjiro berlatih bersama para Hashira.",
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
        status: "Ongoing",
        genre: ["Action", "School"],
        rating: "8.5",
        year: "2024",
        synopsis: "Deku dan teman-temannya menghadapi tantangan baru.",
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
        status: "Ongoing",
        genre: ["Adventure", "Comedy"],
        rating: "9.2",
        year: "1999",
        synopsis: "Petualangan Monkey D. Luffy mencari One Piece.",
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
        status: "Ongoing",
        genre: ["Action", "Horror"],
        rating: "8.8",
        year: "2022",
        synopsis: "Denji menjadi pemburu iblis dengan kekuatan gergaji.",
      },
    ];

    return Array.from({ length: 24 }, (_, index) => {
      const base = mockAnime[index % mockAnime.length];
      return {
        ...base,
        title: `${base.title} ${index > 5 ? `Part ${index - 5}` : ""}`.trim(),
        slug: `${base.slug}-${index}`,
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
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center py-16">
            <LoadingSpinner />
            <p className="text-gray-400 mt-4">Memuat anime ongoing...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <motion.section
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="space-y-8"
        >
          {/* Section Header */}
          <motion.div
            className="flex items-center justify-between"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-lg">
                <FilmIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  Anime Ongoing
                </h1>
                <p className="text-gray-400 text-lg">
                  Daftar anime terbaru yang sedang tayang (menggunakan data
                  update terbaru)
                </p>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-6 mb-8"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="bg-blue-500 text-white px-2 py-1 text-xs font-semibold rounded-full">
                    📺 ONGOING
                  </span>
                  <span className="text-blue-400 text-sm">
                    {animeList.length} anime tersedia
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-1">
                  Anime Sedang Tayang
                </h3>
                <p className="text-gray-300">
                  Temukan anime ongoing terbaru dan terpopuler yang sedang
                  tayang
                </p>
              </div>
            </div>
          </motion.div>

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
                        delay: index * 0.05,
                      },
                    },
                  }}
                >
                  <AnimeCard
                    anime={{
                      ...anime,
                      status: "Ongoing",
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
                <FilmIcon className="w-16 h-16 mx-auto mb-4" />
                <p className="text-lg font-semibold">Belum ada anime ongoing</p>
                <p className="text-gray-500 mt-2">
                  Cek kembali nanti untuk anime ongoing terbaru
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
      </div>
    </div>
  );
}
