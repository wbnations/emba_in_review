/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // This helps prevent build crashes related to image optimization
  images: {
    unoptimized: true, 
  },
};

export default nextConfig;