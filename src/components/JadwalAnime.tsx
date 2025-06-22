"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AnimeCard from "./AnimeCard";
import LoadingSpinner from "./LoadingSpinner";
import { CalendarIcon, ClockIcon } from "@heroicons/react/24/outline";
import apiConfig from "@/config/apiConfig";

interface JadwalAnimeData {
  title: string;
  slug?: string;
  url?: string;
  poster?: string;
  thumb?: string;
  episode?: string;
  time?: string;
  day?: string;
  status?: string;
}

interface JadwalByDay {
  [key: string]: JadwalAnimeData[];
}

const daysOfWeek = [
  { id: "senin", name: "Senin", color: "from-red-500 to-pink-500" },
  { id: "selasa", name: "Selasa", color: "from-orange-500 to-yellow-500" },
  { id: "rabu", name: "Rabu", color: "from-yellow-500 to-green-500" },
  { id: "kamis", name: "Kamis", color: "from-green-500 to-teal-500" },
  { id: "jumat", name: "Jumat", color: "from-teal-500 to-blue-500" },
  { id: "sabtu", name: "Sabtu", color: "from-blue-500 to-indigo-500" },
  { id: "minggu", name: "Minggu", color: "from-indigo-500 to-purple-500" },
];

export default function JadwalAnime() {
  const [jadwalData, setJadwalData] = useState<JadwalByDay>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>("");

  useEffect(() => {
    // Set current day as default
    const today = new Date().getDay();
    const dayNames = [
      "minggu",
      "senin",
      "selasa",
      "rabu",
      "kamis",
      "jumat",
      "sabtu",
    ];
    setSelectedDay(dayNames[today]);

    fetchJadwal();
  }, []);

  const fetchJadwal = async () => {
    try {
      setLoading(true);
      setError(null);

      const apiCall = apiConfig.JADWAL();
      const response = await fetch(apiCall.url, apiCall.options);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("API Response:", data);

      // Handle API response structure
      let scheduleData: JadwalByDay = {};

      if (
        data &&
        data.status === "Success" &&
        data.result &&
        Array.isArray(data.result)
      ) {
        // Process the API data structure
        data.result.forEach((dayData: any) => {
          if (
            dayData.day &&
            dayData.animeList &&
            Array.isArray(dayData.animeList)
          ) {
            const dayKey = dayData.day.toLowerCase();
            scheduleData[dayKey] = dayData.animeList.map((anime: any) => ({
              title: anime.anime_name || "Unknown Anime",
              slug: anime.anime_name
                ? anime.anime_name.toLowerCase().replace(/[^a-z0-9]+/g, "-")
                : "unknown",
              poster: anime.cover || "/placeholder-anime.jpg",
              thumb: anime.cover || "/placeholder-anime.jpg",
              time: "TBA", // API doesn't provide time info
              day: dayData.day,
              status: "Ongoing",
              episode: "TBA", // API doesn't provide episode info
            }));
          }
        });
      }

      // If no valid data found, use fallback
      if (Object.keys(scheduleData).length === 0) {
        console.warn("No valid schedule data found, using fallback");
        scheduleData = generateMockJadwal();
        setError(
          "⚠️ Menampilkan jadwal contoh karena gagal memuat dari server"
        );
      } else {
        console.log("Successfully loaded schedule data from API");
      }

      setJadwalData(scheduleData);
    } catch (err) {
      console.error("Error fetching jadwal:", err);
      setError("Gagal memuat jadwal anime");
      // Use mock data as fallback
      setJadwalData(generateMockJadwal());
    } finally {
      setLoading(false);
    }
  };

  // Generate mock jadwal data for development/fallback
  const generateMockJadwal = (): JadwalByDay => {
    const mockAnime = [
      { title: "Jujutsu Kaisen Season 2", time: "23:00", episode: "23" },
      { title: "Attack on Titan Final Season", time: "00:10", episode: "87" },
      { title: "Demon Slayer: Hashira Training", time: "23:15", episode: "8" },
      { title: "My Hero Academia Season 7", time: "17:30", episode: "20" },
      { title: "One Piece", time: "09:30", episode: "1085" },
      { title: "Chainsaw Man", time: "24:00", episode: "12" },
      { title: "Spy x Family Season 2", time: "23:30", episode: "12" },
      { title: "Tokyo Revengers Season 3", time: "01:35", episode: "13" },
    ];

    const jadwal: JadwalByDay = {};
    daysOfWeek.forEach((day, dayIndex) => {
      jadwal[day.id] = mockAnime
        .slice(dayIndex, dayIndex + 3)
        .map((anime, index) => ({
          ...anime,
          slug: `${anime.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")}-${index}`,
          poster: "/placeholder-anime.jpg",
          day: day.name,
          status: "Ongoing",
        }));
    });

    return jadwal;
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
        <LoadingSpinner size="lg" text="Memuat jadwal anime..." />
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="bg-gradient-to-r from-primary-500 to-purple-500 p-3 rounded-lg">
            <CalendarIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Jadwal Anime
          </h1>
        </div>
        <p className="text-xl text-gray-400 mb-8">
          Jadwal tayang anime terbaru minggu ini. Jangan sampai ketinggalan!
        </p>
      </motion.div>

      {/* Day Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex flex-wrap justify-center gap-2 md:gap-4 mb-8"
      >
        {daysOfWeek.map((day) => {
          const isSelected = selectedDay === day.id;
          const animeCount = jadwalData[day.id]?.length || 0;

          return (
            <motion.button
              key={day.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedDay(day.id)}
              className={`relative px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                isSelected
                  ? `bg-gradient-to-r ${day.color} text-white shadow-lg`
                  : "bg-dark-800 text-gray-300 hover:bg-dark-700 hover:text-white"
              }`}
            >
              <div className="text-center">
                <div className="text-sm md:text-base font-bold">{day.name}</div>
                <div className="text-xs opacity-75">{animeCount} anime</div>
              </div>
              {isSelected && (
                <motion.div
                  layoutId="selectedDay"
                  className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 rounded-xl"
                />
              )}
            </motion.button>
          );
        })}
      </motion.div>

      {/* Selected Day Content */}
      <motion.div
        key={selectedDay}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {selectedDay &&
        jadwalData[selectedDay] &&
        jadwalData[selectedDay].length > 0 ? (
          <>
            {/* Day Header */}
            <div className="flex items-center space-x-3 mb-6">
              <div
                className={`bg-gradient-to-r ${
                  daysOfWeek.find((d) => d.id === selectedDay)?.color
                } p-2 rounded-lg`}
              >
                <ClockIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {daysOfWeek.find((d) => d.id === selectedDay)?.name}
                </h2>
                <p className="text-gray-400">
                  {jadwalData[selectedDay].length} anime tayang hari ini
                </p>
              </div>
            </div>

            {/* Anime List */}
            <div className="space-y-4">
              {jadwalData[selectedDay].map((anime, index) => (
                <motion.div
                  key={anime.slug || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-dark-800 rounded-lg p-4 border border-dark-700 hover:border-primary-500/50 transition-all duration-300"
                >
                  <div className="flex items-center space-x-4">
                    {/* Time */}
                    <div className="flex-shrink-0">
                      <div
                        className={`bg-gradient-to-r ${
                          daysOfWeek.find((d) => d.id === selectedDay)?.color
                        } px-3 py-2 rounded-lg text-center`}
                      >
                        <div className="text-white font-bold text-sm">
                          {anime.time || "00:00"}
                        </div>
                        <div className="text-white/80 text-xs">WIB</div>
                      </div>
                    </div>

                    {/* Anime Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold text-lg truncate">
                        {anime.title}
                      </h3>
                      <div className="flex items-center space-x-4 mt-1">
                        {anime.episode && (
                          <span className="text-gray-400 text-sm">
                            Episode {anime.episode}
                          </span>
                        )}
                        {anime.status && (
                          <span className="bg-green-500/20 text-green-400 px-2 py-1 text-xs rounded-full">
                            {anime.status}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex-shrink-0">
                      <motion.a
                        href={`/anime/${
                          anime.slug || encodeURIComponent(anime.url || "")
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200 text-sm"
                      >
                        Tonton
                      </motion.a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="text-gray-400">
              <CalendarIcon className="w-16 h-16 mx-auto mb-4" />
              <p className="text-lg font-semibold">
                Tidak ada anime yang tayang hari{" "}
                {daysOfWeek.find((d) => d.id === selectedDay)?.name}
              </p>
              <p className="text-gray-500 mt-2">
                Pilih hari lain untuk melihat jadwal anime
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Show error message if there's an error but we have fallback data */}
      {error && Object.keys(jadwalData).length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mt-6"
        >
          <p className="text-yellow-400 text-sm">
            ⚠️ Menampilkan jadwal contoh karena gagal memuat dari server
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
