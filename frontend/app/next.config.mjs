/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    images: {
        domains: ['cos-theta.s3.eu-north-1.amazonaws.com'], 
      },
};

export default nextConfig;
