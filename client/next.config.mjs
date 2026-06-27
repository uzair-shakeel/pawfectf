import dotenv from "dotenv";
dotenv.config();

let userConfig = undefined;
try {
  userConfig = await import("./v0-user-next.config");
} catch (e) {
  // ignore error
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_URL || !API_BASE_URL) {
  throw new Error(
    "❌ Missing required API environment variables in .env file."
  );
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disable to prevent double renders
  
  experimental: {
    optimizePackageImports: ["lucide-react", "react-icons", "framer-motion", "chart.js", "react-chartjs-2", "swiper", "@radix-ui/react-accordion", "@radix-ui/react-select"],
  },
  
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },

  env: {
    NEXT_PUBLIC_API_URL: API_URL,
    NEXT_PUBLIC_API_BASE_URL: API_BASE_URL,
  },

  images: {
    domains: [
      "res.cloudinary.com",
      "images.unsplash.com",
      "img.clerk.com",
      "localhost",
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  async rewrites() {
    // Next.js API routes (detect-image, blur-plate, vin-lookup, save-edited-image, cars/featured)
    // are handled by Next.js and don't need rewrites
    // Only proxy backend API routes
    return [
      // Proxy for image detection API to backend
      {
        source: "/api/image-detection/:path*",
        destination: `${API_BASE_URL}/api/image-detection/:path*`,
      },
      {
        source: "/api/cars/:path*",
        destination: `${API_BASE_URL}/api/cars/:path*`,
      },
      {
        source: "/api/users/:path*",
        destination: `${API_BASE_URL}/api/users/:path*`,
      },
      {
        source: "/api/auth/:path*",
        destination: `${API_BASE_URL}/api/auth/:path*`,
      },
      {
        source: "/api/chat/:path*",
        destination: `${API_BASE_URL}/api/chat/:path*`,
      },
      {
        source: "/api/buyer-requests/:path*",
        destination: `${API_BASE_URL}/api/buyer-requests/:path*`,
      },
      {
        source: "/api/seller-offers/:path*",
        destination: `${API_BASE_URL}/api/seller-offers/:path*`,
      },
      {
        source: "/api/notifications/:path*",
        destination: `${API_BASE_URL}/api/notifications/:path*`,
      },
    ];
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  output: "standalone",

  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true,

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
    ];
  },
};

mergeConfig(nextConfig, userConfig);

function mergeConfig(nextConfig, userConfig) {
  if (!userConfig) {
    return;
  }

  for (const key in userConfig) {
    if (
      typeof nextConfig[key] === "object" &&
      !Array.isArray(nextConfig[key])
    ) {
      nextConfig[key] = {
        ...nextConfig[key],
        ...userConfig[key],
      };
    } else {
      nextConfig[key] = userConfig[key];
    }
  }
}

export default nextConfig;