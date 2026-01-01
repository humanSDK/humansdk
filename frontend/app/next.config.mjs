/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone", // This is required for Docker deployments
    reactStrictMode: false,
    images: {
        domains: ['cos-theta.s3.eu-north-1.amazonaws.com'], 
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
