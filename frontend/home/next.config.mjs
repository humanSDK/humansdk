/** @type {import('next').NextConfig} */
const nextConfig = {
  publicRuntimeConfig: {
    COS_THETA_APP: process.env.NEXT_PUBLIC_COS_THETA_APP,
  },
  images: {
    domains: ['cos-theta.s3.eu-north-1.amazonaws.com'],
  },
};

export default nextConfig;
