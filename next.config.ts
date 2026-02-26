import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/courses',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
