/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true, // Temp as some images are not loading on next-video domain
    dangerouslyAllowSVG: true, // Temp as SVGs are not loading
    domains: ["localhost"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.ipfs.w3s.link",
      },
      {
        protocol: "https",
        hostname: "**api.multiavatar.com**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com**",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback.fs = false;
    }
    return config;
  },
};

module.exports = nextConfig;
