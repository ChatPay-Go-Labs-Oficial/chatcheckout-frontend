import type { NextConfig } from 'next';
import i18nConfig from './next-i18next.config';

const nextConfig: NextConfig = {
  i18n: i18nConfig.i18n,
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com', // Placeholder images for development
        pathname: '/**',
      },
      // TODO: Add production CDN/storage domains here
      // Example:
      // {
      //   protocol: 'https',
      //   hostname: 'your-cdn-domain.com',
      //   pathname: '/images/**',
      // },
      // {
      //   protocol: 'https',
      //   hostname: 'your-storage.blob.core.windows.net',
      //   pathname: '/**',
      // },
    ],
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
