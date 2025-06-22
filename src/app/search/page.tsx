import { Suspense } from "react";
import SearchResults from "@/components/SearchResults";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Metadata } from "next";

interface SearchPageProps {
  searchParams: {
    q?: string;
  };
}

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const query = searchParams.q || "";

  return {
    title: query
      ? `Hasil Pencarian "${query}" - Zephyre`
      : "Pencarian Anime - Zephyre",
    description: query
      ? `Hasil pencarian anime untuk "${query}". Temukan anime favorit kamu di Zephyre.`
      : "Cari anime favorit kamu di Zephyre. Ribuan anime dengan subtitle Indonesia tersedia gratis.",
    openGraph: {
      title: query
        ? `Hasil Pencarian "${query}" - Zephyre`
        : "Pencarian Anime - Zephyre",
      description: query
        ? `Hasil pencarian anime untuk "${query}"`
        : "Cari anime favorit kamu di Zephyre",
    },
  };
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense
          fallback={
            <div className="text-center py-16">
              <LoadingSpinner size="lg" text="Mencari anime..." />
            </div>
          }
        >
          <SearchResults query={query} />
        </Suspense>
      </div>
    </div>
  );
}
