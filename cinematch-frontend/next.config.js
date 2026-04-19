/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  // Modern way to configure remote images (replaces domains)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        port: '',
        pathname: '/t/p/**',
      },
      {
        protocol: 'https',
        hostname: 'www.themoviedb.org',
        port: '',
        pathname: '/**',
      },
    ],
  },
  
  // Turbopack configuration
  turbopack: {
    root: path.join(__dirname),
  },
};

module.exports = nextConfig;