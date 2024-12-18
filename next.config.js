/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://api.near.social/:path*'
      }
    ]
  }
}

module.exports = nextConfig
