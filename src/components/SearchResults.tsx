"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AnimeCard from "./AnimeCard";
import LoadingSpinner from "./LoadingSpinner";
import { MagnifyingGlassIcon, XCircleIcon } from "@heroicons/react/24/outline";
import apiConfig from "@/config/apiConfig";

interface SearchResultsProps {
  query: string;
}

interface SearchAnime {
  title: string;
  slug?: string;
  url?: string;
  poster?: string;
  thumb?: string;
  episode?: string;
  rating?: string;
  status?: string;
  genre?: string[];
  synopsis?: string;
  year?: string;
}

export default function SearchResults({ query }: SearchResultsProps) {
  const [results, setResults] = useState<SearchAnime[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(query);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    }
  }, [query]);

  const performSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;

    try {
      setLoading(true);
      setError(null);
      setHasSearched(true);

      const apiCall = apiConfig.SEARCH(searchTerm.trim());
      const response = await fetch(apiCall.url, apiCall.options);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Handle API response structure
      let searchResults: SearchAnime[] = [];

      if (
        data &&
        data.status === "Success" &&
        data.result &&
        Array.isArray(data.result)
      ) {
        // Process the API data structure
        searchResults = data.result.map((anime: any) => ({
          title: anime.judul || "Unknown Anime",
          slug: anime.link
            ? anime.link.split("/").filter(Boolean).pop() || "unknown"
            : "unknown",
          url: anime.link,
          poster: anime.thumbnail || "/placeholder-anime.jpg",
          thumb: anime.thumbnail || "/placeholder-anime.jpg",
          episode: "TBA", // API doesn't provide episode info
          rating: "N/A", // API doesn't provide rating info
          status: "Unknown", // API doesn't provide status info
          genre: [], // API doesn't provide genre info
          synopsis: "Deskripsi tidak tersedia", // API doesn't provide synopsis
          year: "N/A", // API doesn't provide year info
        }));
        console.log(
          "Successfully loaded search results from API:",
          searchResults.length,
          "results"
        );
      } else {
        console.warn("No valid search results found, using fallback");
        // Create mock search results for development
        searchResults = generateMockSearchResults(searchTerm);
      }

      setResults(searchResults);
    } catch (err) {
      console.error("Error searching anime:", err);
      setError("Gagal mencari anime");
      // Use mock data as fallback
      setResults(generateMockSearchResults(searchTerm));
    } finally {
      setLoading(false);
    }
  };

  // Generate mock search results for development/fallback
  const generateMockSearchResults = (searchTerm: string): SearchAnime[] => {
    const mockResults = [
      {
        title: `${searchTerm} - Attack on Titan`,
        slug: "attack-on-titan",
        poster: "/placeholder-anime.jpg",
        episode: "87",
        rating: "9.0",
        status: "Completed",
        genre: ["Action", "Drama", "Fantasy"],
        synopsis: "Humanity fights for survival against giant humanoid Titans.",
        year: "2013",
      },
      {
        title: `${searchTerm} - Demon Slayer`,
        slug: "demon-slayer",
        poster: "/placeholder-anime.jpg",
        episode: "44",
        rating: "8.7",
        status: "Ongoing",
        genre: ["Action", "Supernatural", "Historical"],
        synopsis: "A young boy becomes a demon slayer to save his sister.",
        year: "2019",
      },
      {
        title: `${searchTerm} - Jujutsu Kaisen`,
        slug: "jujutsu-kaisen",
        poster: "/placeholder-anime.jpg",
        episode: "24",
        rating: "8.6",
        status: "Ongoing",
        genre: ["Action", "School", "Supernatural"],
        synopsis: "Students fight cursed spirits in modern Japan.",
        year: "2020",
      },
    ];

    return mockResults.filter((anime) =>
      anime.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      performSearch(searchQuery.trim());
      // Update URL without page reload
      const url = new URL(window.location.href);
      url.searchParams.set("q", searchQuery.trim());
      window.history.pushState({}, "", url.toString());
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setResults([]);
    setHasSearched(false);
    setError(null);
    // Clear URL params
    const url = new URL(window.location.href);
    url.searchParams.delete("q");
    window.history.pushState({}, "", url.toString());
  };

  return (
    <div className="space-y-8">
      {/* Search Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Pencarian Anime
        </h1>
        <p className="text-xl text-gray-400 mb-8">
          Temukan anime favorit kamu dari ribuan koleksi kami
        </p>
      </motion.div>

      {/* Search Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="max-w-2xl mx-auto"
      >
        <form onSubmit={handleSearch} className="relative">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari anime berdasarkan judul..."
              className="w-full px-6 py-4 pl-14 pr-32 bg-dark-800/80 backdrop-blur-sm border border-dark-600 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 text-lg"
            />
            <MagnifyingGlassIcon className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />

            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-20 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
              >
                <XCircleIcon className="w-5 h-5" />
              </button>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-primary-500 to-purple-500 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Mencari..." : "Cari"}
            </motion.button>
          </div>
        </form>
      </motion.div>

      {/* Search Results */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        {loading && (
          <div className="text-center py-16">
            <LoadingSpinner size="lg" text="Mencari anime..." />
          </div>
        )}

        {error && results.length === 0 && (
          <div className="text-center py-16">
            <div className="text-red-400 mb-4">
              <XCircleIcon className="w-16 h-16 mx-auto mb-4" />
              <p className="text-lg font-semibold">{error}</p>
              <p className="text-gray-400 mt-2">
                Silakan coba lagi dengan kata kunci yang berbeda
              </p>
            </div>
          </div>
        )}

        {hasSearched && !loading && results.length === 0 && !error && (
          <div className="text-center py-16">
            <div className="text-gray-400">
              <MagnifyingGlassIcon className="w-16 h-16 mx-auto mb-4" />
              <p className="text-lg font-semibold">Tidak ada hasil ditemukan</p>
              <p className="text-gray-500 mt-2">
                Coba gunakan kata kunci yang berbeda atau periksa ejaan
              </p>
            </div>
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-6">
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">
                Hasil Pencarian untuk "{query || searchQuery}"
              </h2>
              <span className="text-gray-400">
                {results.length} anime ditemukan
              </span>
            </div>

            {/* Results Grid */}
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {results.map((anime, index) => (
                <AnimeCard
                  key={anime.slug || anime.url || index}
                  anime={anime}
                  index={index}
                  variant="default"
                />
              ))}
            </motion.div>

            {/* Show error message if there's an error but we have fallback data */}
            {error && results.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mt-6"
              >
                <p className="text-yellow-400 text-sm">
                  ⚠️ Menampilkan hasil pencarian contoh karena gagal memuat dari
                  server
                </p>
              </motion.div>
            )}
          </div>
        )}

        {!hasSearched && !query && (
          <div className="text-center py-16">
            <div className="text-gray-400">
              <MagnifyingGlassIcon className="w-16 h-16 mx-auto mb-4" />
              <p className="text-lg font-semibold">Mulai pencarian anime</p>
              <p className="text-gray-500 mt-2">
                Masukkan judul anime yang ingin kamu cari
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
