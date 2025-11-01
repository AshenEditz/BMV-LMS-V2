/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'i.imgur.com',
      'imgur.com',
      'raw.githubusercontent.com',
      'github.com',
      'firebasestorage.googleapis.com',
    ],
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_SCHOOL_NAME: process.env.NEXT_PUBLIC_SCHOOL_NAME,
    NEXT_PUBLIC_SCHOOL_LOGO: process.env.NEXT_PUBLIC_SCHOOL_LOGO,
    NEXT_PUBLIC_MAIN_WEBSITE: process.env.NEXT_PUBLIC_MAIN_WEBSITE,
  },
}

module.exports = nextConfig
