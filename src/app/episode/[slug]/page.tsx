"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";
import apiConfig from "@/config/apiConfig";
import { motion } from "framer-motion";
import {
  PlayIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

interface StreamQuality {
  quality: string;
  serverList: {
    server: string;
    streamUrl: string;
  }[];
}

interface StreamResponse {
  status: string;
  code: number;
  powered: string;
  result: StreamQuality[];
}

interface EpisodeData {
  title: string;
  episode: string;
  streamQualities: StreamQuality[];
  prevEpisode?: string;
  nextEpisode?: string;
}

interface Props {
  params: {
    slug: string | string[] | any;
  };
}

export default function EpisodePage({ params }: Props) {
  const { slug } = params;
  const router = useRouter();
  const [episodeData, setEpisodeData] = useState<EpisodeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuality, setSelectedQuality] = useState<string>("");
  const [availableQualities, setAvailableQualities] = useState<string[]>([]);
  const [selectedStreamUrl, setSelectedStreamUrl] = useState<string>("");
  const [currentServer, setCurrentServer] = useState<string>("OndesuHD");
  const [availableServers, setAvailableServers] = useState<string[]>([]);
  const [serverQualities, setServerQualities] = useState<{
    [server: string]: { quality: string; streamUrl: string }[];
  }>({});

  useEffect(() => {
    const fetchEpisodeData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Handle slug parameter - ensure it's a string
        console.log("Raw slug:", slug);
        console.log("Slug type:", typeof slug);
        console.log("Slug is array:", Array.isArray(slug));
        console.log("Slug stringified:", JSON.stringify(slug));

        let episodeUrl: string;

        if (Array.isArray(slug)) {
          // Handle array of strings or objects
          const processedSlug = slug.map((item) => {
            if (typeof item === "string") {
              return item;
            } else if (typeof item === "object" && item !== null) {
              // If it's an object, try to extract URL or convert to string
              if ("url" in item) {
                return item.url;
              } else if ("href" in item) {
                return item.href;
              } else {
                // Convert object to string representation
                return Object.values(item).join("/");
              }
            }
            return String(item);
          });

          episodeUrl = processedSlug.join("/");
          console.log("Processed slug array:", processedSlug);
          console.log("Slug was array, joined to:", episodeUrl);
        } else if (typeof slug === "string") {
          // First decode the URL-encoded string
          let decodedSlug = decodeURIComponent(slug);
          console.log("Decoded slug:", decodedSlug);

          // Check if the decoded string contains '[object Object]'
          if (decodedSlug.includes("[object Object]")) {
            console.log(
              "Detected [object Object] in slug, this indicates improper URL encoding"
            );

            // This suggests the original URL was not properly handled
            // We need to get the actual episode URL from the browser location or referrer
            const currentUrl = window.location.href;
            console.log("Current URL:", currentUrl);

            // Try to extract episode URL from the current page URL or use a fallback
            // For now, throw a more descriptive error
            throw new Error(
              `URL episode rusak karena encoding yang salah. URL mengandung '[object Object]' yang menunjukkan data tidak valid. Silakan kembali ke halaman sebelumnya dan coba lagi.`
            );
          }

          episodeUrl = decodedSlug;
        } else if (typeof slug === "object" && slug !== null) {
          // Handle single object
          if ("url" in slug) {
            episodeUrl = String(slug.url);
          } else if ("href" in slug) {
            episodeUrl = String(slug.href);
          } else {
            episodeUrl = Object.values(slug).join("/");
          }
          console.log("Slug was object, converted to:", episodeUrl);
        } else {
          throw new Error(
            `Slug parameter tidak valid: ${typeof slug}. Expected string, array, or object.`
          );
        }

        console.log("Final episode URL:", episodeUrl);
        console.log("Episode URL type:", typeof episodeUrl);
        console.log("Episode URL length:", episodeUrl.length);
        console.log("Environment API Key:", process.env.NEXT_PUBLIC_API_KEY);
        console.log("Current working environment:", process.env.NODE_ENV);

        // Validate episode URL format
        if (!episodeUrl || !episodeUrl.includes("otakudesu")) {
          throw new Error(
            `URL episode tidak valid: ${episodeUrl}. Pastikan URL berasal dari Otakudesu.`
          );
        }

        // Fetch episode stream data
        const streamConfig = apiConfig.STREAM(episodeUrl);
        console.log("Stream API URL:", streamConfig.url);
        console.log("Stream API Options:", streamConfig.options);
        console.log(
          "API Key being used:",
          streamConfig.options.headers["mg-apikey"]
        );

        const streamResponse = await fetch(
          streamConfig.url,
          streamConfig.options
        );

        if (!streamResponse.ok) {
          const errorText = await streamResponse.text();
          console.error("API Response Error:", {
            status: streamResponse.status,
            statusText: streamResponse.statusText,
            body: errorText,
          });
          throw new Error(
            `API Error ${streamResponse.status}: ${streamResponse.statusText}. Periksa koneksi internet atau coba lagi nanti.`
          );
        }

        const streamData: StreamResponse = await streamResponse.json();
        console.log("Stream API response:", streamData);

        if (
          !streamData ||
          streamData.status !== "Success" ||
          !streamData.result
        ) {
          console.error("Stream API failed, trying EPISODE API as fallback...");
          console.error("Stream API response:", streamData);

          // Try EPISODE API as fallback
          try {
            const episodeConfig = apiConfig.EPISODE(episodeUrl);
            console.log("Trying EPISODE API URL:", episodeConfig.url);

            const episodeResponse = await fetch(
              episodeConfig.url,
              episodeConfig.options
            );

            if (!episodeResponse.ok) {
              throw new Error(
                `Episode API also failed: ${episodeResponse.status}`
              );
            }

            const episodeData = await episodeResponse.json();
            console.log("Episode API response:", episodeData);

            if (
              episodeData &&
              episodeData.status === "Success" &&
              episodeData.result
            ) {
              // Use episode data if available
              console.log("Using Episode API data as fallback");
              // You might need to adapt the data structure here
            } else {
              throw new Error(
                `Episode API juga gagal: ${episodeData?.status || "Unknown"}`
              );
            }
          } catch (fallbackError) {
            console.error(
              "Both Stream and Episode APIs failed:",
              fallbackError
            );
          }

          throw new Error(
            `API mengembalikan status: ${
              streamData?.status || "Unknown"
            }. Episode mungkin tidak tersedia atau terjadi masalah server.`
          );
        }

        // First try to filter ondesuhd servers
        let filteredQualities = streamData.result
          .map((qualityData) => ({
            quality: qualityData.quality,
            serverList: qualityData.serverList.filter((server) =>
              server.server.toLowerCase().includes("ondesuhd")
            ),
          }))
          .filter((qualityData) => qualityData.serverList.length > 0);

        console.log("Filtered ondesuhd servers:", filteredQualities);

        // If no ondesuhd servers found, use all available servers
        if (filteredQualities.length === 0) {
          console.log("No ondesuhd servers found, using all available servers");
          filteredQualities = streamData.result
            .map((qualityData) => ({
              quality: qualityData.quality,
              serverList: qualityData.serverList,
            }))
            .filter((qualityData) => qualityData.serverList.length > 0);
        }

        if (filteredQualities.length === 0) {
          throw new Error("No servers available for this episode");
        }

        // Extract episode title from URL
        const urlParts = episodeUrl.split("/");
        const episodeName =
          urlParts[urlParts.length - 2] || urlParts[urlParts.length - 1];
        const episodeTitle = episodeName
          .replace("-sub-indo", "")
          .replace(/-/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase());

        const episodeData: EpisodeData = {
          title: episodeTitle,
          episode: episodeTitle,
          streamQualities: filteredQualities,
        };

        setEpisodeData(episodeData);

        // Group qualities by server and remove duplicates
        const serverQualitiesMap: {
          [server: string]: { quality: string; streamUrl: string }[];
        } = {};

        filteredQualities.forEach((qualityData) => {
          qualityData.serverList.forEach((server) => {
            const normalizedServerName = server.server.trim().toLowerCase();
            const displayServerName = server.server.trim();

            // Find existing server with same normalized name
            const existingServerKey = Object.keys(serverQualitiesMap).find(
              (key) => key.toLowerCase() === normalizedServerName
            );

            const serverKey = existingServerKey || displayServerName;

            if (!serverQualitiesMap[serverKey]) {
              serverQualitiesMap[serverKey] = [];
            }

            // Check if quality already exists for this server
            const qualityExists = serverQualitiesMap[serverKey].some(
              (q) => q.quality === qualityData.quality
            );

            if (!qualityExists) {
              serverQualitiesMap[serverKey].push({
                quality: qualityData.quality,
                streamUrl: server.streamUrl,
              });
            }
          });
        });

        // Get unique server names and sort them (prioritize ondesuhd)
        const uniqueServers = Object.keys(serverQualitiesMap).sort((a, b) => {
          const aIsOndesu = a.toLowerCase().includes("ondesuhd");
          const bIsOndesu = b.toLowerCase().includes("ondesuhd");
          if (aIsOndesu && !bIsOndesu) return -1;
          if (!aIsOndesu && bIsOndesu) return 1;
          return a.localeCompare(b);
        });

        setAvailableServers(uniqueServers);
        setServerQualities(serverQualitiesMap);

        // Set default server (prioritize ondesuhd)
        const defaultServer =
          uniqueServers.find((server) =>
            server.toLowerCase().includes("ondesuhd")
          ) || uniqueServers[0];

        if (defaultServer) {
          setCurrentServer(defaultServer);

          // Set available qualities for default server
          const defaultServerQualities =
            serverQualitiesMap[defaultServer] || [];
          const qualities = defaultServerQualities.map((q) => q.quality);
          setAvailableQualities(qualities);

          // Set default quality (highest) for default server
          if (qualities.length > 0) {
            const defaultQuality = qualities[qualities.length - 1];
            setSelectedQuality(defaultQuality);

            const defaultQualityData = defaultServerQualities.find(
              (q) => q.quality === defaultQuality
            );
            if (defaultQualityData) {
              setSelectedStreamUrl(defaultQualityData.streamUrl);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching episode data:", error);
        let errorMessage = "Terjadi kesalahan yang tidak diketahui";

        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === "string") {
          errorMessage = error;
        }

        // Add specific error messages for common issues
        if (
          errorMessage.includes("Failed to fetch") ||
          errorMessage.includes("NetworkError")
        ) {
          errorMessage =
            "Tidak dapat terhubung ke server. Periksa koneksi internet Anda dan coba lagi.";
        } else if (errorMessage.includes("404")) {
          errorMessage =
            "Episode tidak ditemukan. URL mungkin salah atau episode telah dihapus.";
        } else if (errorMessage.includes("500")) {
          errorMessage =
            "Server sedang mengalami masalah. Silakan coba lagi nanti.";
        }

        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchEpisodeData();
    }
  }, [slug]);

  const handleServerChange = (server: string) => {
    setCurrentServer(server);

    // Update available qualities for selected server
    const currentServerQualities = serverQualities[server] || [];
    const qualities = currentServerQualities.map((q) => q.quality);
    setAvailableQualities(qualities);

    // Set default quality (highest) for new server
    if (qualities.length > 0) {
      const defaultQuality = qualities[qualities.length - 1];
      setSelectedQuality(defaultQuality);

      const defaultQualityData = currentServerQualities.find(
        (q) => q.quality === defaultQuality
      );
      if (defaultQualityData) {
        setSelectedStreamUrl(defaultQualityData.streamUrl);
      }
    }
  };

  const handleQualityChange = (quality: string) => {
    setSelectedQuality(quality);

    // Find the stream URL for the selected quality from ondesuhd server first
    const qualityData = episodeData?.streamQualities.find(
      (q) => q.quality === quality
    );

    if (qualityData) {
      // Try to find ondesuhd server first
      const ondesuhdServer = qualityData.serverList.find((server) =>
        server.server.toLowerCase().includes("ondesuhd")
      );

      if (ondesuhdServer) {
        setSelectedStreamUrl(ondesuhdServer.streamUrl);
        setCurrentServer(ondesuhdServer.server);
      } else if (qualityData.serverList.length > 0) {
        // Fallback to first available server
        setSelectedStreamUrl(qualityData.serverList[0].streamUrl);
        setCurrentServer(qualityData.serverList[0].server);
      }
    }
  };

  const handleQualityChangeForServer = (quality: string) => {
    setSelectedQuality(quality);

    const currentServerQualities = serverQualities[currentServer] || [];
    const qualityData = currentServerQualities.find(
      (q) => q.quality === quality
    );
    if (qualityData) {
      setSelectedStreamUrl(qualityData.streamUrl);
    }
  };

  const handleBackToAnime = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 pt-20">
        <div className="text-center py-16">
          <LoadingSpinner
            size="lg"
            text={
              <>
                Sabar Gann....
                <br />
                Orang sabar di sayang Tuhan
              </>
            }
          />
        </div>
      </div>
    );
  }

  if (error || !episodeData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <p className="text-red-400 text-lg mb-6">
              {error || "Episode tidak ditemukan"}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  // Trigger refetch by updating a dependency
                  window.location.reload();
                }}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors duration-200 flex items-center justify-center"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                    clipRule="evenodd"
                  />
                </svg>
                Coba Lagi
              </button>
              <button
                onClick={() => router.back()}
                className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg transition-colors duration-200"
              >
                Kembali
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-400 hover:text-white transition-colors duration-200 mb-4"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Kembali
          </button>
          <h1 className="text-3xl font-bold text-white mb-2">
            {episodeData.title}
          </h1>
          <p className="text-gray-400 text-lg">{episodeData.episode}</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Video Player */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-3"
          >
            <div className="bg-dark-800 rounded-lg overflow-hidden">
              {selectedStreamUrl ? (
                <div className="aspect-video">
                  <iframe
                    src={selectedStreamUrl}
                    className="w-full h-full border-0"
                    allowFullScreen
                    title={`${episodeData.title} - ${episodeData.episode}`}
                  />
                </div>
              ) : (
                <div className="aspect-video flex items-center justify-center bg-dark-700">
                  <div className="text-center">
                    <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <p className="text-red-400 font-medium mb-2">
                      Video Tidak Tersedia
                    </p>
                    <p className="text-gray-400">
                      Server OndesuHD tidak tersedia untuk episode ini
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Video Controls */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 bg-dark-800 rounded-lg p-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {/* Quality Selector */}
                {currentServer &&
                  serverQualities[currentServer] &&
                  serverQualities[currentServer].length > 0 && (
                    <div className="flex items-center gap-3">
                      <label className="text-gray-300 text-sm font-medium">
                        Kualitas Video:
                      </label>
                      <select
                        value={selectedQuality}
                        onChange={(e) =>
                          handleQualityChangeForServer(e.target.value)
                        }
                        className="bg-dark-700 border border-dark-600 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors duration-200"
                      >
                        {serverQualities[currentServer].map(
                          (qualityData, index) => (
                            <option key={index} value={qualityData.quality}>
                              {qualityData.quality}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                  )}

                {/* Download Button */}
                {selectedStreamUrl && (
                  <button
                    onClick={async () => {
                      try {
                        // Use the original episode URL (slug) for download API
                        const episodeUrl = decodeURIComponent(slug);
                        const downloadConfig = apiConfig.DOWNLOAD(episodeUrl);

                        const response = await fetch(
                          downloadConfig.url,
                          downloadConfig.options
                        );

                        if (!response.ok) {
                          throw new Error(
                            `Download failed: ${response.status}`
                          );
                        }

                        const downloadData = await response.json();

                        if (
                          downloadData.status === "Success" &&
                          downloadData.result
                        ) {
                          // Open download page in new tab
                          window.open(
                            downloadData.result.downloadUrl ||
                              downloadData.result,
                            "_blank"
                          );
                        } else {
                          alert("Download tidak tersedia untuk episode ini");
                        }
                      } catch (error) {
                        console.error("Download error:", error);
                        alert("Terjadi kesalahan saat mengunduh video");
                      }
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 font-medium text-sm flex items-center justify-center"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Download Video
                  </button>
                )}
              </div>

              {/* Stream Info */}
              <div className="mt-4 pt-4 border-t border-dark-700">
                <div className="flex flex-wrap gap-4 text-sm">
                  <span className="text-gray-300">
                    Server:{" "}
                    <span className="text-primary-400 font-medium">
                      {currentServer}
                    </span>
                  </span>
                  <span className="text-gray-300">
                    Kualitas:{" "}
                    <span className="text-primary-400 font-medium">
                      {selectedQuality}
                    </span>
                  </span>
                  <span className="text-gray-300">
                    Status:{" "}
                    <span className="text-green-400 font-medium">Online</span>
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-1 space-y-6"
          >
            {/* Episode Info */}
            <div className="bg-dark-800 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <PlayIcon className="w-5 h-5 mr-2" />
                Informasi Episode
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Server:</span>
                  <span className="text-primary-400 font-medium">
                    {currentServer}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Kualitas:</span>
                  <span className="text-primary-400 font-medium">
                    {selectedQuality}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className="text-green-400 font-medium">Online</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Tersedia:</span>
                  <span className="text-blue-400 font-medium">
                    {availableServers.length} server
                  </span>
                </div>
              </div>
            </div>

            {/* Server Selection */}
            {availableServers.length > 0 && (
              <div className="bg-dark-800 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <PlayIcon className="w-5 h-5 mr-2" />
                  Pilih Server
                </h3>

                {/* Recommendation Notice */}
                <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4 mb-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-blue-400 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-blue-300 mb-1">
                        💡 Catatan
                      </h4>
                      <p className="text-sm text-blue-200">
                        Pilih server{" "}
                        <span className="font-semibold text-blue-100">
                          Sendiri
                        </span>{" "}
                        Bro, Ke ganggu iklan Atau Error Pilih Server Lain.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Server Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {availableServers.map((server, index) => (
                    <button
                      key={index}
                      onClick={() => handleServerChange(server)}
                      className={`text-left p-3 rounded-lg border transition-all duration-200 ${
                        currentServer === server
                          ? "bg-primary-500/20 border-primary-500 text-primary-300"
                          : "bg-dark-700 border-dark-600 text-gray-300 hover:border-primary-500/50 hover:bg-dark-600"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate">
                            {server}
                          </p>
                          <p className="text-xs opacity-75">
                            {serverQualities[server]?.length || 0} kualitas
                          </p>
                        </div>
                        {currentServer === server && (
                          <PlayIcon className="w-4 h-4 text-primary-400 ml-1 flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
