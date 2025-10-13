/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // IMPORTANT: do NOT set `output: 'export'`. We need SSR on Vercel.
};

module.exports = nextConfig;
