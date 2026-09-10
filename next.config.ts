import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "tcoeolazrlitiyxtyful.supabase.co", pathname: "/storage/v1/object/public/**" },
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
    qualities: [60, 75, 85],
    deviceSizes: [360, 640, 768, 1024, 1280, 1536, 1920],
  },
  async redirects() {
    return [
      { source: "/vendite", destination: "/vendita", permanent: true },
      { source: "/affitti", destination: "/affitto", permanent: true },
      { source: "/valutazione", destination: "/valuta-casa", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
