/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ['react-quill'],
    experimental: {
        serverActions: {
            allowedOrigins: ['localhost:5000', '127.0.0.1:5000'],
        },
    },

};

export default nextConfig;
