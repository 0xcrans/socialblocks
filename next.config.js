/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/near/:path*',
        destination: 'https://api.near.social/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
