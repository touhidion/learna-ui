import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Traces the minimal set of files the server needs, so the Docker runtime
  // stage can ship without node_modules — feature UIF4.
  output: "standalone",

  // Blocks a deploy on a type error rather than shipping one. It defaults to
  // false already; stated so nobody flips it on to unblock a build.
  // (Next 16 dropped the `eslint` config key — lint runs via `npm run lint`.)
  typescript: { ignoreBuildErrors: false },

  images: {
    // Cloudinary is the only remote image host — thumbnails, avatars and
    // certificate logos all come from res.cloudinary.com.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },

  // Trims the X-Powered-By fingerprint.
  poweredByHeader: false,

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
