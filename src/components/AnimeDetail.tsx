"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import LoadingSpinner from "./LoadingSpinner";
import {
  PlayIcon,
  ArrowDownTrayIcon,
  StarIcon,
  CalendarIcon,
  FilmIcon,
  TagIcon,
  ClockIcon,
  EyeIcon,
  ShareIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolidIcon } from "@heroicons/react/24/solid";
import apiConfig from "@/config/apiConfig";

interface StreamLink {
  quality: string;
  url: string;
}

interface StreamQuality {
  quality: string;
  url: string;
}

interface StreamResponse {
  success: boolean;
  result: {
    streamUrl: string;
    qualities: StreamQuality[];
  };
}

interface AnimeDetailData {
  title?: string;
  poster?: string;
  thumb?: string;
  synopsis?: string;
  rating?: string;
  status?: string;
  type?: string;
  episodes?: number | string;
  duration?: string;
  release?: string;
  studio?: string;
  producer?: string;
  japanese?: string;
  genre?: string[];
  episodeList?: EpisodeData[];
  streamLinks?: StreamLink[];
}

interface EpisodeData {
  episode: string;
  url: string;
  date?: string;
}

interface Props {
  slug: string;
}

export default function AnimeDetail({ slug }: Props) {
  const router = useRouter();
  const [animeData, setAnimeData] = useState<AnimeDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"episodes" | "info">("episodes");
  const [selectedEpisode, setSelectedEpisode] = useState<string | null>(null);
  const [streamData, setStreamData] = useState<StreamResponse | null>(null);
  const [streamLoading, setStreamLoading] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState<string>("720p");
  const [deviceInfo, setDeviceInfo] = useState<string>("");
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportMessage, setReportMessage] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [showThankYouModal, setShowThankYouModal] = useState(false);

  const handleReportError = () => {
    console.log("Report button clicked, showing modal");
    console.log("showReportModal before:", showReportModal);
    setShowReportModal(true);
    console.log("showReportModal state after setting:", true);
    // Force a re-render by using setTimeout
    setTimeout(() => {
      console.log("showReportModal after timeout:", showReportModal);
    }, 100);
  };

  const handleSubmitReport = async () => {
    setIsSubmittingReport(true);
    console.log("Submitting report...");

    try {
      // Prepare report message with device info and user's message
      const reportContent = `LAPORAN ERROR ANIME\n\nAnime: ${
        animeData?.title || slug
      }\nURL: ${
        window.location.href
      }\n\nPesan User: ${reportMessage}\n\n${deviceInfo}`;
      console.log("Report content prepared:", reportContent);

      // Send report to WhatsApp via API
      console.log("Sending report to API...");
      // Gunakan API route Next.js yang akan di-proxy ke WhatsApp bot
      // Ini akan bekerja baik di development maupun production (Vercel)
      const apiUrl = "/api/whatsapp-report";

      console.log("Using API URL:", apiUrl);

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: reportContent }),
      });

      console.log("API response received, status:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("API response body:", result);

      if (!result.success) {
        console.error("Failed to send report to WhatsApp:", result.error);
        alert(`Gagal mengirim laporan ke WhatsApp: ${result.error}`);
      } else {
        console.log("Report sent to WhatsApp successfully");
        // alert("Laporan berhasil dikirim. Terima kasih atas bantuan Anda!");
      }
    } catch (error) {
      console.error("Error sending report to WhatsApp:", error);
      alert(
        `Error: ${
          error instanceof Error ? error.message : "Unknown error occurred"
        }`
      );
    } finally {
      setIsSubmittingReport(false);
      setShowReportModal(false);
      setReportMessage("");
      // Show thank you modal after report is submitted
      setShowThankYouModal(true);
      // Auto close thank you modal after 3 seconds
      setTimeout(() => {
        setShowThankYouModal(false);
      }, 3000);
    }
  };

  useEffect(() => {
    fetchAnimeDetail();
    getDeviceInfo();
  }, [slug]);

  const getDeviceInfo = () => {
    try {
      const userAgent = navigator.userAgent;
      const platform = navigator.platform;
      const language = navigator.language;
      const screenResolution = `${screen.width}x${screen.height}`;
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const currentTime = new Date().toLocaleString("id-ID");

      const info = `Device Info:
- User Agent: ${userAgent}
- Platform: ${platform}
- Language: ${language}
- Screen: ${screenResolution}
- Timezone: ${timezone}
- Time: ${currentTime}
- URL: ${window.location.href}`;

      setDeviceInfo(info);
    } catch (error) {
      setDeviceInfo("Device info tidak tersedia");
    }
  };

  const fetchAnimeDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get anime name from slug and create the correct URL format
      let decodedSlug = decodeURIComponent(slug);
      console.log("Processing anime slug:", decodedSlug);

      let animeUrl;
      // Check if the slug is actually a full URL (from lastupdate API)
      if (decodedSlug.startsWith("https://otakudesu.")) {
        animeUrl = decodedSlug;
        console.log("Using direct URL from lastupdate:", animeUrl);
      } else {
        // Use the old logic for anime name-based slugs
        animeUrl = `https://otakudesu.cloud/anime/${decodedSlug}`;
        console.log("Using constructed URL:", animeUrl);
      }

      let data;
      let response;
      let success = false;

      // Try the main URL format first
      try {
        const apiCall = apiConfig.DETAIL(animeUrl);
        console.log("=== API REQUEST DEBUG ===");
        console.log("Request URL:", apiCall.url);
        console.log("Request Options:", apiCall.options);
        console.log("Target Anime URL:", animeUrl);

        response = await fetch(apiCall.url, apiCall.options);
        console.log("Response Status:", response.status);
        console.log("Response Headers:", response.headers);

        if (response.ok) {
          data = await response.json();
          console.log("=== API RESPONSE DEBUG ===");
          console.log("Full Response Data:", JSON.stringify(data, null, 2));
          console.log("Response Success:", data.success);
          console.log("Response Status:", data.status);
          console.log("Response Result:", data.result);

          if (
            (data.success || data.status === "Success") &&
            data.result &&
            Object.keys(data.result).length > 0
          ) {
            success = true;
            console.log(
              "✅ Successfully fetched data with main URL:",
              animeUrl
            );
          } else {
            console.log("❌ API returned empty or invalid result");
          }
        } else {
          console.log(
            "❌ Response not OK:",
            response.status,
            response.statusText
          );
        }
      } catch (error) {
        console.log("❌ Main URL approach failed:", error);
      }

      // If main URL failed, try alternative formats as fallback
      if (!success) {
        // Only try fallback URLs if we're not using a direct URL from lastupdate
        let urlFormats = [];
        if (decodedSlug.startsWith("https://otakudesu.")) {
          // For direct URLs, try different domain variations
          const urlPath = decodedSlug.replace(/https:\/\/otakudesu\.[^/]+/, "");
          urlFormats = [
            decodedSlug + "/",
            `https://otakudesu.cloud${urlPath}`,
            `https://otakudesu.cloud${urlPath}/`,
            `https://otakudesu.video${urlPath}`,
            `https://otakudesu.video${urlPath}/`,
            `https://otakudesu.bid${urlPath}`,
            `https://otakudesu.bid${urlPath}/`,
          ];
        } else {
          // For anime name slugs, use the old fallback logic
          urlFormats = [
            `https://otakudesu.cloud/anime/${decodedSlug}/`,
            `https://otakudesu.cloud/${decodedSlug}/`,
            `https://otakudesu.video/anime/${decodedSlug}/`,
            `https://otakudesu.video/${decodedSlug}/`,
            `https://otakudesu.bid/anime/${decodedSlug}/`,
            `https://otakudesu.bid/${decodedSlug}/`,
          ];
        }

        for (let index = 0; index < urlFormats.length; index++) {
          const testUrl = urlFormats[index];
          try {
            console.log(`🔄 Trying fallback URL format ${index + 1}:`, testUrl);
            const apiCall = apiConfig.DETAIL(testUrl);
            console.log(`Fallback API Call ${index + 1}:`, apiCall.url);

            response = await fetch(apiCall.url, apiCall.options);
            console.log(
              `Fallback Response ${index + 1} Status:`,
              response.status
            );

            if (response.ok) {
              data = await response.json();
              console.log(
                `Fallback Response ${index + 1} Data:`,
                JSON.stringify(data, null, 2)
              );

              if (
                (data.success || data.status === "Success") &&
                data.result &&
                Object.keys(data.result).length > 0
              ) {
                success = true;
                console.log(
                  `✅ Successfully fetched data with fallback URL format ${
                    index + 1
                  }:`,
                  testUrl
                );
                break;
              } else {
                console.log(`❌ Fallback ${index + 1} returned empty result`);
              }
            } else {
              console.log(
                `❌ Fallback ${index + 1} response not OK:`,
                response.status
              );
            }
          } catch (error) {
            console.log(`URL format ${index + 1} failed:`, error);
          }
        }
      }

      // If all approaches failed, set appropriate error data
      if (!success) {
        console.log("All API approaches failed for:", animeUrl);
        data = { success: false, message: "No data found" };
      }

      // Handle different API response structures
      let detailData: AnimeDetailData;
      if (data.result) {
        // Handle Maelyn API structure
        const result = data.result;
        console.log("=== DATA MAPPING DEBUG ===");
        console.log("Raw API result data:", result);
        console.log("Available fields in result:", Object.keys(result));

        // Generate title from slug if not available from API
        let titleFromApi = result.judul || result.title;
        console.log("Title from API (judul):", result.judul);
        console.log("Title from API (title):", result.title);

        if (!titleFromApi || titleFromApi === "") {
          // Extract anime name from URL or use slug directly
          let nameForTitle = decodedSlug;
          if (decodedSlug.startsWith("https://otakudesu.")) {
            // Extract anime name from URL path
            const urlParts = decodedSlug.split("/");
            nameForTitle =
              urlParts[urlParts.length - 2] || urlParts[urlParts.length - 1];
            nameForTitle = nameForTitle.replace("-sub-indo", "");
          }
          titleFromApi = nameForTitle
            .replace(/-/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase());
          console.log("Generated title from slug:", titleFromApi);
        }

        console.log("=== FIELD MAPPING ===");
        console.log("Synopsis (sinopsis):", result.sinopsis);
        console.log("Rating:", result.rating);
        console.log("Episodes (epsd_url length):", result.epsd_url?.length);
        console.log("Episodes (total_episode):", result.total_episode);
        console.log("Status (anime_status):", result.anime_status);
        console.log("Duration (durasi):", result.durasi);
        console.log("Studio:", result.studio);
        console.log("Genre:", result.genre);
        console.log("Episode List (epsd_url):", result.epsd_url);

        detailData = {
          title: titleFromApi,
          poster: result.thumbnail || result.poster,
          thumb: result.thumbnail || result.thumb,
          synopsis: result.sinopsis || result.synopsis || "",
          rating: result.rating !== undefined ? result.rating : "N/A",
          status: result.anime_status || result.status || "Unknown",
          type: result.tipe || result.type || "TV",
          episodes:
            result.epsd_url?.length || parseInt(result.total_episode) || 0,
          duration: result.durasi || result.duration || "Unknown",
          release:
            result.rilis || result.tanggal_rilis || result.release || "Unknown",
          studio: result.studio || "Unknown",
          genre:
            typeof result.genre === "string"
              ? result.genre.split(", ")
              : result.genre || [],
          producer: result.produser || result.producer || "Unknown",
          japanese: result.japanese || "",
          streamLinks: result.streamLinks || [],
          episodeList:
            result.epsd_url?.map((ep: any) => {
              console.log("Processing episode:", ep);
              console.log("Episode URL type:", typeof (ep.epsd_url || ep.url));
              console.log("Episode URL value:", ep.epsd_url || ep.url);

              // Ensure episode URL is always a string
              let episodeUrl = ep.epsd_url || ep.url;
              if (typeof episodeUrl === "object" && episodeUrl !== null) {
                // If it's an object, try to extract URL from common properties
                if ("url" in episodeUrl) {
                  episodeUrl = String(episodeUrl.url);
                } else if ("href" in episodeUrl) {
                  episodeUrl = String(episodeUrl.href);
                } else if ("epsd_url" in episodeUrl) {
                  episodeUrl = String(episodeUrl.epsd_url);
                } else {
                  // Fallback: create a placeholder URL using episode title/index
                  const episodeTitle =
                    ep.title ||
                    ep.episode ||
                    `episode-${Math.random().toString(36).substr(2, 9)}`;
                  episodeUrl = `https://otakudesu.cloud/episode/${episodeTitle
                    .replace(/\s+/g, "-")
                    .toLowerCase()}`;
                  console.warn(
                    "Episode URL is object without expected properties, using fallback:",
                    episodeUrl
                  );
                  console.warn("Original problematic object:", ep);
                }
              } else {
                episodeUrl = String(episodeUrl || "");
              }

              // Additional validation to prevent [object Object] in episode data
              if (
                episodeUrl.includes("[object Object]") ||
                episodeUrl.startsWith("{") ||
                episodeUrl.startsWith("[")
              ) {
                const episodeTitle =
                  ep.title ||
                  ep.episode ||
                  `episode-${Math.random().toString(36).substr(2, 9)}`;
                episodeUrl = `https://otakudesu.cloud/episode/${episodeTitle
                  .replace(/\s+/g, "-")
                  .toLowerCase()}`;
                console.warn(
                  "Detected invalid URL format, using title-based fallback:",
                  episodeUrl
                );
              }

              console.log("Final processed episode URL:", episodeUrl);

              return {
                episode: ep.title || ep.episode,
                url: episodeUrl,
                date: ep.date,
              };
            }) || [],
        };
        console.log("=== FINAL PROCESSED DATA ===");
        console.log("Final detailData:", detailData);
        console.log("Final synopsis:", detailData.synopsis);
        console.log("Final rating:", detailData.rating);
        console.log("Final episodes:", detailData.episodes);
        console.log(
          "Final episodeList length:",
          detailData.episodeList?.length
        );
      } else if (data.data) {
        detailData = data.data;
      } else {
        detailData = data;
      }

      // Check if API returned an error about plugins being inactive
      if (
        data.status === "Failed!" &&
        data.result &&
        data.result.includes("Plugins sedang tidak active")
      ) {
        console.log("API plugins are currently inactive:", data.result);
        setError("Plugins API sedang tidak aktif - Server maintenance");

        const displayTitle = slug
          .replace(/-/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase());

        detailData = {
          title: displayTitle,
          poster: "/placeholder-anime.jpg",
          synopsis: `Maaf, layanan detail anime sedang mengalami gangguan teknis.\n\n🔧 **Status Server**: Plugins API sedang tidak aktif\n⏰ **Estimasi**: Sedang dalam perbaikan\n\n**Sementara waktu, Anda dapat:**\n• Mencoba anime lain dari daftar\n• Kembali lagi dalam beberapa saat\n• Melihat jadwal anime terbaru\n\nTerima kasih atas pengertiannya.`,
          rating: "N/A",
          status: "Server Maintenance",
          type: "Unknown",
          episodes: "N/A",
          duration: "Unknown",
          release: "Unknown",
          studio: "Unknown",
          genre: [],
          episodeList: [],
        };
      }
      // Handle cases where API doesn't return valid data
      else if (
        !detailData ||
        Object.keys(detailData).length === 0 ||
        (!data.success && data.status !== "Success") ||
        ((data.success || data.status === "Success") &&
          (!data.result || Object.keys(data.result).length === 0))
      ) {
        // Generate fallback data with informative message
        const displayTitle = slug
          .replace(/-/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase());

        detailData = {
          title: displayTitle,
          poster: "/placeholder-anime.jpg",
          synopsis: `Maaf, detail untuk anime "${displayTitle}" sedang tidak tersedia saat ini. Hal ini bisa terjadi karena:\n\n• Anime belum tersedia di database\n• Link anime tidak valid\n• Sedang ada masalah dengan server\n\nSilakan coba anime lain atau coba lagi nanti.`,
          rating: "N/A",
          status: "Unknown",
          type: "Unknown",
          episodes: "Unknown",
          duration: "Unknown",
          release: "Unknown",
          studio: "Unknown",
          genre: [],
          episodeList: [],
        };
      } else {
        // If we have some data from API, use it even if incomplete
        console.log("Data available but checking synopsis:", detailData);

        // Only fill missing synopsis if it's truly empty AND we don't have real data from API
        // Don't replace synopsis if API returned valid data structure (even if synopsis is empty)
        if (
          (!detailData.synopsis || detailData.synopsis === "") &&
          (!data.result || typeof data.result.sinopsis === "undefined")
        ) {
          // Use the generated title from slug for fallback messages
          const displayTitle =
            detailData.title ||
            slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

          // Check if we have episode data to show
          const hasEpisodes =
            detailData.episodeList && detailData.episodeList.length > 0;
          if (hasEpisodes && detailData.episodeList) {
            detailData.synopsis = `${displayTitle} tersedia untuk ditonton dengan ${detailData.episodeList.length} episode. Informasi detail synopsis sedang tidak tersedia saat ini.`;
          } else {
            detailData.synopsis = `${displayTitle} - Informasi detail synopsis sedang tidak tersedia saat ini.`;
          }
        }
      }

      setAnimeData(detailData);
    } catch (err) {
      console.error("Error fetching anime detail:", err);
      setError("Gagal memuat detail anime");

      // Generate informative fallback data
      const displayTitle = slug
        .replace(/-/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());

      const fallbackData = {
        title: displayTitle,
        poster: "/placeholder-anime.jpg",
        synopsis: `Maaf, terjadi kesalahan saat memuat detail anime "${displayTitle}". Hal ini bisa terjadi karena:\n\n• Koneksi internet bermasalah\n• Server sedang maintenance\n• Link anime tidak valid\n\nSilakan refresh halaman atau coba lagi nanti.`,
        rating: "N/A",
        status: "Unknown",
        type: "Unknown",
        episodes: "Unknown",
        duration: "Unknown",
        release: "Unknown",
        studio: "Unknown",
        genre: [],
        episodeList: [],
      };

      setAnimeData(fallbackData);
    } finally {
      setLoading(false);
    }
  };

  // Generate mock anime detail for development/fallback
  const fetchStreamData = async (episodeUrl: string) => {
    try {
      setStreamLoading(true);
      console.log("Fetching stream data for:", episodeUrl);

      const apiCall = apiConfig.STREAM(episodeUrl);
      const response = await fetch(apiCall.url, apiCall.options);

      if (response.ok) {
        const data = await response.json();
        console.log("Stream data received:", data);

        if (data.success && data.result) {
          setStreamData(data);
          return data;
        }
      }

      throw new Error("Failed to fetch stream data");
    } catch (error) {
      console.error("Error fetching stream data:", error);
      setError("Gagal memuat data streaming");
      return null;
    } finally {
      setStreamLoading(false);
    }
  };

  const generateMockAnimeDetail = (): AnimeDetailData => {
    const title = decodeURIComponent(slug)
      .replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());

    return {
      title: title,
      poster: "/placeholder-anime.jpg",
      synopsis: `${title} adalah anime yang menceritakan petualangan seorang protagonis dalam dunia yang penuh dengan tantangan dan misteri. Dengan alur cerita yang menarik dan karakter-karakter yang berkembang, anime ini menawarkan pengalaman menonton yang tak terlupakan. Setiap episode menghadirkan aksi yang memukau dan emosi yang mendalam, membuat penonton terus penasaran dengan kelanjutan ceritanya.`,
      rating: "8.5",
      status: "Ongoing",
      type: "TV Series",
      episodes: "24",
      duration: "24 min",
      release: "2024",
      studio: "Studio Animation",
      genre: ["Action", "Adventure", "Drama", "Fantasy"],
      episodeList: [],
    };
  };

  const handleEpisodeClick = async (
    episodeUrl: string,
    episodeTitle: string
  ) => {
    try {
      console.log("Episode clicked:", { episodeUrl, episodeTitle });
      console.log("Episode URL type:", typeof episodeUrl);
      console.log("Episode URL value:", episodeUrl);

      // Comprehensive validation for episodeUrl
      if (!episodeUrl) {
        console.error("Episode URL is empty or undefined");
        alert("Error: Episode URL tidak tersedia");
        return;
      }

      // Check if episodeUrl is an object (this should not happen but let's be safe)
      if (typeof episodeUrl === "object") {
        console.error("Episode URL is an object:", episodeUrl);
        alert("Error: Format URL episode tidak valid (object detected)");
        return;
      }

      // Convert to string and validate
      const episodeUrlString = String(episodeUrl);
      console.log("Episode URL as string:", episodeUrlString);

      // Check for invalid string formats
      if (
        episodeUrlString.includes("[object Object]") ||
        episodeUrlString.startsWith("{") ||
        episodeUrlString.startsWith("[") ||
        episodeUrlString === "undefined" ||
        episodeUrlString === "null" ||
        episodeUrlString.trim() === ""
      ) {
        console.error("Invalid episode URL format detected:", episodeUrlString);
        alert(
          `Error: Format URL episode tidak valid.\n\nURL: ${episodeUrlString}\n\nSilakan coba episode lain atau laporkan masalah ini.`
        );
        return;
      }

      // Encode the episode URL for safe navigation
      const encodedEpisodeUrl = encodeURIComponent(episodeUrlString);
      console.log("Encoded episode URL:", encodedEpisodeUrl);

      // Final validation: make sure encoded URL doesn't contain [object Object]
      if (encodedEpisodeUrl.includes("[object%20Object]")) {
        console.error(
          "Encoded URL still contains [object Object]:",
          encodedEpisodeUrl
        );
        alert(
          "Error: URL episode mengandung format yang tidak valid setelah encoding. Silakan laporkan masalah ini."
        );
        return;
      }

      // Set selected episode for UI feedback
      setSelectedEpisode(episodeTitle);

      // Navigate to episode page
      const episodePageUrl = `/episode/${encodedEpisodeUrl}`;
      console.log("Navigating to:", episodePageUrl);

      window.location.href = episodePageUrl;
    } catch (error) {
      console.error("Error in handleEpisodeClick:", error);
      alert(
        `Error: ${
          error instanceof Error ? error.message : "Unknown error occurred"
        }`
      );
    }
  };

  const getSelectedStreamUrl = () => {
    if (!streamData?.result?.qualities) return null;

    const selectedStream = streamData.result.qualities.find(
      (q) => q.quality === selectedQuality
    );

    return selectedStream?.url || streamData.result.streamUrl;
  };

  const renderRating = (rating: string) => {
    const numRating = parseFloat(rating);
    const fullStars = Math.floor(numRating);
    const hasHalfStar = numRating % 1 !== 0;

    return (
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, i) => (
          <StarSolidIcon
            key={i}
            className={`w-5 h-5 ${
              i < fullStars
                ? "text-yellow-400"
                : i === fullStars && hasHalfStar
                ? "text-yellow-400"
                : "text-gray-600"
            }`}
          />
        ))}
        <span className="text-white font-semibold ml-2">{rating}/10</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <LoadingSpinner size="lg" text="Memuat detail anime..." />
      </div>
    );
  }
  if (!animeData) {
    return (
      <div className="text-center py-16">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-8 max-w-lg mx-auto">
          <div className="flex items-center justify-center mb-6">
            <ExclamationTriangleIcon className="w-16 h-16 text-red-400" />
          </div>
          <h2 className="text-red-400 text-2xl font-bold mb-3 text-center">
            ⚠️ Anime Tidak Ditemukan
          </h2>
          <p className="text-red-300 text-base text-center mb-6">
            Terjadi kesalahan saat memuat detail anime. Data tidak dapat dimuat
            dari server.
          </p>

          {/* Pengumuman Penting */}
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center mb-2">
              <ChatBubbleLeftRightIcon className="w-6 h-6 text-yellow-400 mr-2" />
              <span className="text-yellow-400 font-bold text-lg">
                📢 PENTING!
              </span>
            </div>
            <p className="text-yellow-300 text-sm text-center leading-relaxed">
              Bantu kami memperbaiki masalah ini dengan melaporkan error yang
              terjadi.
              <span className="font-semibold text-yellow-200">
                Laporan Anda sangat membantu untuk meningkatkan layanan!
              </span>
            </p>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleReportError}
              className={`flex items-center space-x-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-4 rounded-xl text-lg font-bold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl`}
            >
              <ExclamationTriangleIcon className="w-6 h-6" />
              <span>🚨 LAPORKAN ERROR SEKARANG</span>
            </button>
          </div>

          <h1 className="text-3xl font-bold text-white mb-4">
            {animeData
              ? (animeData as any).title || "Anime Detail"
              : "Anime Detail"}
          </h1>
          <div className="flex justify-end mb-4">
            <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded shadow">
              Laporkan Error
            </button>
          </div>
          <p className="text-gray-400 text-xs mt-4 text-center">
            Klik tombol di atas untuk melaporkan masalah ini kepada admin
          </p>
        </div>
      </div>
    );
  }
  // Report Error Modal that should be visible regardless of animeData
  const reportErrorModal = showReportModal ? (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setShowReportModal(false);
        }
      }}
    >
      <div className="bg-dark-800 rounded-lg p-6 w-full max-w-md border border-dark-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white flex items-center">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-400 mr-2" />
            Laporkan Error
          </h3>
          <button
            onClick={() => setShowReportModal(false)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-400 mr-2" />
            <h4 className="text-red-300 font-bold">
              Mohon Maaf Atas Kendala Yang Terjadi
            </h4>
          </div>
          <p className="text-red-200 text-sm mb-2">
            Kami mohon maaf atas kendala yang Anda alami saat menggunakan
            aplikasi ini.
          </p>
          <p className="text-red-200 text-sm">
            Silakan laporkan masalah ini kepada developer agar dapat segera
            diperbaiki.
          </p>
        </div>

        <div className="mb-4">
          <p className="text-gray-300 text-sm mb-2">
            Anime:{" "}
            <span className="text-white font-medium">
              {slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
            </span>
          </p>
          <p className="text-gray-300 text-sm mb-4">
            Jelaskan masalah yang Anda alami:
          </p>

          <textarea
            value={reportMessage}
            onChange={(e) => setReportMessage(e.target.value)}
            placeholder="Contoh: Anime tidak bisa dimuat, error 404, gambar tidak muncul, dll..."
            className="w-full bg-dark-700 border border-dark-600 rounded-lg p-3 text-white placeholder-gray-400 focus:border-primary-500 focus:outline-none resize-none"
            rows={4}
            disabled={isSubmittingReport}
          />
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => setShowReportModal(false)}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            disabled={isSubmittingReport}
          >
            Batal
          </button>
          <button
            onClick={handleSubmitReport}
            disabled={isSubmittingReport || !reportMessage.trim()}
            className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
          >
            {isSubmittingReport ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Mengirim...
              </>
            ) : (
              "Kirim Laporan"
            )}
          </button>
        </div>

        <p className="text-xs text-gray-400 mt-3 text-center">
          Laporan akan dikirim ke admin untuk ditindaklanjuti
        </p>
      </div>
    </div>
  ) : null;

  // Thank You Modal Component
  const thankYouModal = showThankYouModal ? (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-800 rounded-lg p-6 w-full max-w-md border border-dark-700 animate-fade-in">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-green-500 rounded-full p-2 mr-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white">Terima Kasih</h3>
        </div>
        <div className="text-center mb-6">
          <p className="text-gray-300 mb-2">
            Laporan Anda telah berhasil dikirim!
          </p>
          <p className="text-gray-400 text-sm">
            Kami akan segera menindaklanjuti masalah ini.
          </p>
        </div>
      </div>
    </div>
  ) : null;

  // Show loading spinner while data is being fetched
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  // Show error message if data failed to load and no fallback data
  if (error && !animeData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Error</h1>
          <p className="text-gray-300">{error}</p>
        </div>
      </div>
    );
  }

  // Don't render if no data available
  if (!animeData) {
    return null;
  }

  return (
    <>
      {reportErrorModal}
      {thankYouModal}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative bg-dark-800 rounded-2xl overflow-hidden mb-8"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-dark-900/90 to-transparent z-10" />
          <div className="relative z-20 p-6 md:p-8 lg:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Poster */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="lg:col-span-1"
              >
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-2xl">
                  <Image
                    src={animeData.poster || "/placeholder-anime.jpg"}
                    alt={animeData.title || "Anime Poster"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                  />
                </div>
              </motion.div>

              {/* Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="lg:col-span-2 space-y-6"
              >
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h1 className="text-3xl font-bold text-white">
                      {animeData
                        ? (animeData as any).title || "Anime Detail"
                        : "Anime Detail"}
                    </h1>
                    <button
                      onClick={handleReportError}
                      className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition-colors"
                    >
                      <ExclamationTriangleIcon className="w-5 h-5" />
                      <span>Laporkan Error</span>
                    </button>
                  </div>

                  {/* Rating */}
                  <div className="mb-4">
                    {animeData.rating &&
                    animeData.rating !== "" &&
                    animeData.rating !== "N/A" ? (
                      renderRating(animeData.rating)
                    ) : (
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon key={i} className="w-5 h-5 text-gray-500" />
                        ))}
                        <span className="text-gray-400 ml-2">
                          {animeData.rating === "" ? "Belum ada rating" : "N/A"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Meta Info */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {animeData.status && (
                      <div className="flex items-center space-x-2">
                        <EyeIcon className="w-5 h-5 text-primary-400" />
                        <div>
                          <p className="text-gray-400 text-sm">Status</p>
                          <p className="text-white font-semibold">
                            {animeData.status}
                          </p>
                        </div>
                      </div>
                    )}

                    {animeData.episodes !== undefined &&
                      animeData.episodes !== null && (
                        <div className="flex items-center space-x-2">
                          <FilmIcon className="w-5 h-5 text-primary-400" />
                          <div>
                            <p className="text-gray-400 text-sm">Episode</p>
                            <p className="text-white font-semibold">
                              {animeData.episodes === 0
                                ? "Belum tersedia"
                                : animeData.episodes}
                            </p>
                          </div>
                        </div>
                      )}

                    {animeData.duration && (
                      <div className="flex items-center space-x-2">
                        <ClockIcon className="w-5 h-5 text-primary-400" />
                        <div>
                          <p className="text-gray-400 text-sm">Durasi</p>
                          <p className="text-white font-semibold">
                            {animeData.duration}
                          </p>
                        </div>
                      </div>
                    )}

                    {animeData.release && (
                      <div className="flex items-center space-x-2">
                        <CalendarIcon className="w-5 h-5 text-primary-400" />
                        <div>
                          <p className="text-gray-400 text-sm">Rilis</p>
                          <p className="text-white font-semibold">
                            {animeData.release}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Genres */}
                  {animeData.genre && animeData.genre.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center space-x-2 mb-2">
                        <TagIcon className="w-5 h-5 text-primary-400" />
                        <span className="text-gray-400 text-sm">Genre</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(animeData.genre && Array.isArray(animeData.genre)
                          ? animeData.genre
                          : []
                        ).map((genre, index) => (
                          <span
                            key={index}
                            className="bg-primary-500/20 text-primary-300 px-3 py-1 rounded-full text-sm font-medium"
                          >
                            {genre}
                          </span>
                        ))}
                        {(!animeData.genre ||
                          !Array.isArray(animeData.genre) ||
                          animeData.genre.length === 0) && (
                          <span className="text-gray-500 text-sm">
                            Genre tidak tersedia
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Synopsis */}
                  <div>
                    <h3 className="text-xl font-bold text-white mb-3">
                      Sinopsis
                    </h3>
                    {animeData.synopsis && animeData.synopsis.trim() !== "" ? (
                      <p className="text-gray-300 leading-relaxed">
                        {animeData.synopsis}
                      </p>
                    ) : (
                      <p className="text-gray-400 italic">
                        Sinopsis belum tersedia untuk anime ini.
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-8"
        >
          <div className="bg-dark-800 p-4 rounded-lg">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab("episodes")}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center space-x-2 ${
                  activeTab === "episodes"
                    ? "bg-primary-600 text-white shadow-lg"
                    : "text-gray-400 hover:text-white hover:bg-dark-700"
                }`}
              >
                <PlayIcon className="w-5 h-5" />
                <span>Episodes</span>
                {animeData?.episodeList && (
                  <span className="bg-primary-500 text-white text-xs px-2 py-1 rounded-full ml-2">
                    {animeData.episodeList.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("info")}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center space-x-2 ${
                  activeTab === "info"
                    ? "bg-primary-600 text-white shadow-lg"
                    : "text-gray-400 hover:text-white hover:bg-dark-700"
                }`}
              >
                <FilmIcon className="w-5 h-5" />
                <span>Informasi</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === "episodes" && (
            <div className="bg-dark-800 rounded-lg p-6">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-2">
                  Daftar Episode
                </h3>
                <p className="text-gray-400">
                  Pilih episode yang ingin ditonton
                </p>
              </div>

              {animeData?.episodeList && animeData.episodeList.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {animeData.episodeList.map((episode, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      onClick={() =>
                        handleEpisodeClick(episode.url, episode.episode)
                      }
                      className={`bg-dark-700 hover:bg-primary-600 text-white p-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl border-2 ${
                        selectedEpisode === episode.episode
                          ? "border-primary-500 bg-primary-600"
                          : "border-transparent hover:border-primary-500"
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <PlayIcon className="w-5 h-5" />
                        <span className="font-semibold">{episode.episode}</span>
                      </div>
                      {episode.date && (
                        <p className="text-xs text-gray-400 mt-2">
                          {episode.date}
                        </p>
                      )}
                    </motion.button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="bg-dark-700 rounded-lg p-8">
                    <FilmIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-400 mb-2">
                      Episode Belum Tersedia
                    </h3>
                    <p className="text-gray-500">
                      Episode untuk anime ini belum tersedia atau sedang dalam
                      proses update.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "info" && (
            <div className="bg-dark-800 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {animeData.type && (
                    <div>
                      <p className="text-gray-400 text-sm">Tipe</p>
                      <p className="text-white font-semibold">
                        {animeData.type}
                      </p>
                    </div>
                  )}
                  {animeData.studio && (
                    <div>
                      <p className="text-gray-400 text-sm">Studio</p>
                      <p className="text-white font-semibold">
                        {animeData.studio}
                      </p>
                    </div>
                  )}
                  {animeData.producer && (
                    <div>
                      <p className="text-gray-400 text-sm">Produser</p>
                      <p className="text-white font-semibold">
                        {animeData.producer}
                      </p>
                    </div>
                  )}
                  {animeData.release && (
                    <div>
                      <p className="text-gray-400 text-sm">Tanggal Rilis</p>
                      <p className="text-white font-semibold">
                        {animeData.release}
                      </p>
                    </div>
                  )}
                  {animeData.japanese && (
                    <div>
                      <p className="text-gray-400 text-sm">Judul Jepang</p>
                      <p className="text-white font-semibold">
                        {animeData.japanese}
                      </p>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  {animeData.episodes && (
                    <div>
                      <p className="text-gray-400 text-sm">Total Episode</p>
                      <p className="text-white font-semibold">
                        {animeData.episodes}
                      </p>
                    </div>
                  )}
                  {animeData.duration && (
                    <div>
                      <p className="text-gray-400 text-sm">
                        Durasi per Episode
                      </p>
                      <p className="text-white font-semibold">
                        {animeData.duration}
                      </p>
                    </div>
                  )}
                  {animeData.rating && (
                    <div>
                      <p className="text-gray-400 text-sm">Rating</p>
                      <div className="flex items-center space-x-2">
                        <StarSolidIcon className="w-5 h-5 text-yellow-400" />
                        <span className="text-white font-semibold">
                          {animeData.rating}/10
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </>
  );
}
