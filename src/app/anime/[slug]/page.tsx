import { Suspense } from "react";
import AnimeDetail from "@/components/AnimeDetail";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Metadata } from "next";
import { notFound } from "next/navigation";

interface Props {
  params: {
    slug: string;
  };
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params;

  // Decode the slug to get a readable title
  const title = decodeURIComponent(slug)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());

  return {
    title: `${title} - Zephyre`,
    description: `Nonton ${title} subtitle Indonesia. Streaming dan download anime ${title} dengan kualitas HD terbaik.`,
    keywords: `${title}, anime, subtitle indonesia, streaming anime, download anime`,
    openGraph: {
      title: `${title} - Zephyre`,
      description: `Nonton ${title} subtitle Indonesia`,
      type: "video.tv_show",
    },
  };
}

export default function AnimeDetailPage({ params }: Props) {
  const { slug } = params;

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 pt-20">
      <Suspense
        fallback={
          <div className="text-center py-16">
            <LoadingSpinner size="lg" text="Memuat detail anime..." />
          </div>
        }
      >
        <AnimeDetail slug={slug} />
      </Suspense>
    </div>
  );
}
