/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    // Unsure if this is working or needed
    domains: ["localhost", "https://*.ipfs.w3s.link/"],
  },
  webpack: (config, options) => {
    config.module.rules.push({
      test: /\.(ts)x?$/,
      use: [options.defaultLoaders.babel],
    });

    return config;
  },
};

module.exports = nextConfig;
