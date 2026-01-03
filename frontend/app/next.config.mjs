/** @type {import('next').NextConfig} */
const nextConfig = {
    // Removed standalone output as it's not being generated properly
    // Using standard Next.js build instead
  
    reactStrictMode: false,
    images: {
        domains: ['cos-thetas.s3.us-east-1.amazonaws.com'],
    },
    eslint: {
        // Warning: This allows production builds to successfully complete even if
        // your project has ESLint errors/warnings.
        ignoreDuringBuilds: true,
    },
    typescript: {
        // Warning: This allows production builds to successfully complete even if
        // your project has type errors.
        ignoreBuildErrors: false,
    },
};

export default nextConfig;
