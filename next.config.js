/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'badges.frapsoft.com',
      },
      {
        protocol: 'https',
        hostname: 'badge.fury.io',
      },
      {
        protocol: 'https',
        hostname: 'img.shields.io',
      },
    ],
  },
}

module.exports = nextConfig 