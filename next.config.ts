import type { NextConfig } from "next";

// Netlify sets NETLIFY=true in its build environment. Its Next.js runtime does
// its own function bundling and does not support `output: "standalone"`, which
// is exactly what the Docker image needs — so the mode is chosen per target
// rather than hardcoded.
const isNetlify = process.env.NETLIFY === "true";

const nextConfig: NextConfig = {
  // Traces the minimal set of files the server needs, so the Docker runtime
  // stage can ship without node_modules — feature UIF4. Left unset on Netlify,
  // where the platform packages the app itself.
  output: isNetlify ? undefined : "standalone",

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
