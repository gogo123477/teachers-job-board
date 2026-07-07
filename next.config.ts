import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // מספיק ללוגו מוסד ולקובץ קו"ח (PDF/Word) בגודל סביר
      bodySizeLimit: "8mb",
    },
  },
};

export default nextConfig;
