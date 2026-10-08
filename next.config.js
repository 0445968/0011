/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  async headers() {
    const privateSetupHeaders = [
      { key: 'Referrer-Policy', value: 'no-referrer' },
      { key: 'Cache-Control', value: 'no-store' },
    ];
    return [
      { source: '/client/confirm', headers: privateSetupHeaders },
      { source: '/confirm', headers: privateSetupHeaders },
    ];
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;
