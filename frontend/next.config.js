/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "localhost",
      "https://bafkreih5noddbpvsuprh4gmhpiyx47gd6z2pripwqelwspqtxumtauyjra.ipfs.w3s.link/",
    ],
  },
};

module.exports = nextConfig;
