import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [],
  },
  async redirects() {
    return [
      {
        source: "/tools/student-tools/plagiarism-checker",
        destination: "/tools/text-tools/plagiarism-checker",
        permanent: true,
      },
      {
        source: "/tools/audio-tools/text-to-speech",
        destination: "/tools/text-tools/text-to-speech",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;