import type { NextConfig } from 'next';
import withSerwistInit from '@serwist/next';

const withSerwist = withSerwistInit({
  swSrc: 'src/app/sw.ts',
  swDest: 'public/sw.js',
  cacheOnNavigation: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === 'development',
});

const isMaintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true';

const nextConfig: NextConfig = {
  turbopack: {},
  async redirects() {
    if (!isMaintenanceMode) {
      return [];
    }

    return [
      {
        source: '/((?!maintenance).*)',
        destination: '/maintenance',
        permanent: false,
      },
    ];
  },
};

export default withSerwist(nextConfig);
