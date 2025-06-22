"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { PlayIcon, StarIcon, CalendarIcon } from "@heroicons/react/24/solid";
import { ClockIcon } from "@heroicons/react/24/outline";

interface AnimeCardProps {
  anime: {
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
  };
  index?: number;
  variant?: "default" | "large" | "compact";
}

export default function AnimeCard({
  anime,
  index = 0,
  variant = "default",
}: AnimeCardProps) {
  const imageUrl = anime.poster || anime.thumb || "/placeholder-anime.jpg";
  // Prioritize direct URL from API over slug
  const animeUrl = anime.url
    ? `/anime/${encodeURIComponent(anime.url)}`
    : anime.slug
    ? `/anime/${anime.slug}`
    : "#";

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: index * 0.1,
      },
    },
  };

  const hoverVariants = {
    hover: {
      y: -8,
      scale: 1.02,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  if (variant === "compact") {
    return (
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        className="group"
      >
        <Link href={animeUrl}>
          <motion.div
            variants={hoverVariants}
            className="bg-dark-800 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-dark-700 hover:border-primary-500/50"
          >
            <div className="flex">
              {/* Image */}
              <div className="relative w-20 h-28 flex-shrink-0">
                <Image
                  src={imageUrl}
                  alt={anime.title}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-1 left-1">
                  <PlayIcon className="w-4 h-4 text-white opacity-80" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 p-3">
                <h3 className="font-semibold text-sm text-white line-clamp-2 group-hover:text-primary-400 transition-colors duration-200">
                  {anime.title}
                </h3>
                {anime.episode && (
                  <p className="text-xs text-gray-400 mt-1">
                    Episode {anime.episode}
                  </p>
                )}
                {anime.rating && (
                  <div className="flex items-center mt-1">
                    <StarIcon className="w-3 h-3 text-yellow-400 mr-1" />
                    <span className="text-xs text-gray-400">
                      {anime.rating}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </Link>
      </motion.div>
    );
  }

  if (variant === "large") {
    return (
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        className="group"
      >
        <Link href={animeUrl}>
          <motion.div
            variants={hoverVariants}
            className="bg-dark-800 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border border-dark-700 hover:border-primary-500/50"
          >
            {/* Image */}
            <div className="relative aspect-[3/4] overflow-hidden">
              <Image
                src={imageUrl}
                alt={anime.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

              {/* Play button overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-primary-500/90 backdrop-blur-sm rounded-full p-4">
                  <PlayIcon className="w-8 h-8 text-white" />
                </div>
              </div>

              {/* Status badge */}
              {anime.status && (
                <div className="absolute top-3 left-3">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      anime.status.toLowerCase().includes("ongoing")
                        ? "bg-green-500 text-white"
                        : "bg-blue-500 text-white"
                    }`}
                  >
                    {anime.status}
                  </span>
                </div>
              )}

              {/* Episode info */}
              {anime.episode && (
                <div className="absolute bottom-3 left-3">
                  <span className="bg-dark-900/80 backdrop-blur-sm text-white px-2 py-1 text-xs rounded-full">
                    Ep {anime.episode}
                  </span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="font-bold text-lg text-white line-clamp-2 group-hover:text-primary-400 transition-colors duration-200 mb-2">
                {anime.title}
              </h3>

              {anime.synopsis && (
                <p className="text-sm text-gray-400 line-clamp-3 mb-3">
                  {anime.synopsis}
                </p>
              )}

              {/* Meta info */}
              <div className="flex items-center justify-between text-xs text-gray-400">
                {anime.rating && (
                  <div className="flex items-center">
                    <StarIcon className="w-4 h-4 text-yellow-400 mr-1" />
                    <span>{anime.rating}</span>
                  </div>
                )}
                {anime.release_date && (
                  <div className="flex items-center">
                    <CalendarIcon className="w-4 h-4 mr-1" />
                    <span>{anime.release_date}</span>
                  </div>
                )}
              </div>

              {/* Genres */}
              {anime.genre && anime.genre.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {anime.genre.slice(0, 3).map((genre, idx) => (
                    <span
                      key={idx}
                      className="bg-primary-500/20 text-primary-400 px-2 py-1 text-xs rounded-full"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </Link>
      </motion.div>
    );
  }

  // Default variant
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className="group"
    >
      <Link href={animeUrl}>
        <motion.div
          variants={hoverVariants}
          className="bg-dark-800 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-dark-700 hover:border-primary-500/50"
        >
          {/* Image */}
          <div className="relative aspect-[3/4] overflow-hidden">
            <Image
              src={imageUrl}
              alt={anime.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

            {/* Play button overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-primary-500/90 backdrop-blur-sm rounded-full p-3">
                <PlayIcon className="w-6 h-6 text-white" />
              </div>
            </div>

            {/* Episode info */}
            {anime.episode && (
              <div className="absolute bottom-2 left-2">
                <span className="bg-dark-900/80 backdrop-blur-sm text-white px-2 py-1 text-xs rounded-full">
                  Ep {anime.episode}
                </span>
              </div>
            )}

            {/* Latest episode */}
            {anime.latest_episode && (
              <div className="absolute top-2 right-2">
                <span className="bg-green-500 text-white px-2 py-1 text-xs rounded-full flex items-center">
                  <ClockIcon className="w-3 h-3 mr-1" />
                  New
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-3">
            <h3 className="font-semibold text-sm text-white line-clamp-2 group-hover:text-primary-400 transition-colors duration-200 mb-2">
              {anime.title}
            </h3>

            {/* Meta info */}
            <div className="flex items-center justify-between text-xs text-gray-400">
              {anime.rating && (
                <div className="flex items-center">
                  <StarIcon className="w-3 h-3 text-yellow-400 mr-1" />
                  <span>{anime.rating}</span>
                </div>
              )}
              {anime.status && (
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    anime.status.toLowerCase().includes("ongoing")
                      ? "bg-green-500/20 text-green-400"
                      : "bg-blue-500/20 text-blue-400"
                  }`}
                >
                  {anime.status}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
