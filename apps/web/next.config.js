/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@jed/shared'],
  images: {
    unoptimized: true,
  },
};
module.exports = nextConfig;
