/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // IMPORTANT: do NOT set `output: 'export'`. We need SSR on Vercel.
  // experimental: { appDir: true } // (not required; App Router is already active)
};

module.exports = nextConfig;
