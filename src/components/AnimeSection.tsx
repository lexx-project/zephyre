"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import AnimeCard from "./AnimeCard";
import LoadingSpinner from "./LoadingSpinner";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import apiConfig from "@/config/apiConfig";

interface AnimeSectionProps {
  title: string;
  type: "ongoing" | "completed" | "lastupdate";
  description?: string;
  limit?: number;
  showViewAll?: boolean;
}

interface AnimeData {
  title: string;
  slug?: string;
  url?: string;
  poster?: string;
  thumb?: string;
  episode?: string;
  rating?: string;
  status?: string;
  release_date?: string;
  latest_episode?: string;
  genre?: string[];
  synopsis?: string;
}

export default function AnimeSection({
  title,
  type,
  description,
  limit = 12,
  showViewAll = true,
}: AnimeSectionProps) {
  const [animeList, setAnimeList] = useState<AnimeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnime = async () => {
      try {
        setLoading(true);
        setError(null);

        let apiCall;
        switch (type) {
          case "ongoing":
            apiCall = apiConfig.ONGOING();
            break;
          case "completed":
            apiCall = apiConfig.COMPLETED();
            break;
          case "lastupdate":
            apiCall = apiConfig.LASTUPDATE();
            break;
          default:
            throw new Error("Invalid anime type");
        }

        const response = await fetch(apiCall.url, apiCall.options);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Handle different API response structures
        let animeData: AnimeData[] = [];
        if (data.data && Array.isArray(data.data)) {
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
            status: item.status,
            rating: item.rating,
            genre: item.genre,
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
            status: item.status,
            rating: item.rating,
            genre: item.genre,
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
            status: item.status,
            rating: item.rating,
            genre: item.genre,
          }));
        } else {
          console.warn("Unexpected API response structure:", data);
          // Create mock data for development
          animeData = generateMockData(limit);
        }

        setAnimeList(animeData.slice(0, limit));
      } catch (err) {
        console.error("Error fetching anime:", err);
        setError("Gagal memuat data anime");
        // Use mock data as fallback
        setAnimeList(generateMockData(limit));
      } finally {
        setLoading(false);
      }
    };

    fetchAnime();
  }, [type, limit]);

  // Generate mock data for development/fallback
  const generateMockData = (count: number): AnimeData[] => {
    const mockTitles = [
      "Attack on Titan Final Season",
      "Demon Slayer: Kimetsu no Yaiba",
      "Jujutsu Kaisen",
      "One Piece",
      "Naruto Shippuden",
      "My Hero Academia",
      "Tokyo Revengers",
      "Chainsaw Man",
      "Spy x Family",
      "Mob Psycho 100",
      "Death Note",
      "Fullmetal Alchemist",
    ];

    return Array.from({ length: count }, (_, index) => ({
      title: mockTitles[index % mockTitles.length] || `Anime ${index + 1}`,
      slug: `anime-${index + 1}`,
      poster: "/placeholder-anime.jpg",
      episode: `${Math.floor(Math.random() * 24) + 1}`,
      rating: `${(Math.random() * 2 + 7).toFixed(1)}`,
      status: type === "ongoing" ? "Ongoing" : "Completed",
      genre: ["Action", "Adventure", "Drama"].slice(
        0,
        Math.floor(Math.random() * 3) + 1
      ),
      synopsis:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    }));
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
        <p className="text-gray-400 mt-4">Memuat {title.toLowerCase()}...</p>
      </div>
    );
  }

  if (error && animeList.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-red-400 mb-4">
          <svg
            className="w-16 h-16 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-lg font-semibold">{error}</p>
          <p className="text-gray-400 mt-2">Silakan coba lagi nanti</p>
        </div>
      </div>
    );
  }

  return (
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
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
            {title}
          </h2>
          {description && (
            <p className="text-gray-400 text-lg">{description}</p>
          )}
        </div>

        {showViewAll && (
          <Link
            href={`/${type}`}
            className="flex items-center text-primary-400 hover:text-primary-300 transition-colors duration-200 group"
          >
            <span className="font-semibold mr-2">Lihat Semua</span>
            <ChevronRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
        )}
      </motion.div>

      {/* Anime Grid */}
      {animeList.length > 0 ? (
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6"
          variants={containerVariants}
        >
          {animeList.map((anime, index) => (
            <AnimeCard
              key={anime.slug || anime.url || index}
              anime={anime}
              index={index}
              variant="default"
            />
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-16">
          <div className="text-gray-400">
            <svg
              className="w-16 h-16 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2M9 10h6m-6 4h6"
              />
            </svg>
            <p className="text-lg font-semibold">Tidak ada anime ditemukan</p>
            <p className="text-gray-500 mt-2">
              Coba lagi nanti atau periksa koneksi internet Anda
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
