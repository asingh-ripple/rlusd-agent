/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  webpack(config) {
    // Configure how files get handled
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack']
    });
    
    return config;
  },
}

module.exports = nextConfig; 