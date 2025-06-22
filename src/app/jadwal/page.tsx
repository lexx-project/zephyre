import { Suspense } from "react";
import JadwalAnime from "@/components/JadwalAnime";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jadwal Anime - Zephyre",
  description:
    "Lihat jadwal tayang anime terbaru minggu ini. Jangan sampai ketinggalan episode anime favorit kamu.",
  keywords: "jadwal anime, anime schedule, anime terbaru, anime ongoing",
  openGraph: {
    title: "Jadwal Anime - Zephyre",
    description: "Lihat jadwal tayang anime terbaru minggu ini",
  },
};

export default function JadwalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense
          fallback={
            <div className="text-center py-16">
              <LoadingSpinner size="lg" text="Memuat jadwal anime..." />
            </div>
          }
        >
          <JadwalAnime />
        </Suspense>
      </div>
    </div>
  );
}
