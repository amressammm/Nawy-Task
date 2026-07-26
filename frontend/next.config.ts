import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Emits a self-contained server bundle, so the runtime image needs no
  // node_modules and stays small.
  output: 'standalone',
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'images.unsplash.com' }],
    // The browser fetches these directly instead of routing them through the
    // Next optimizer. The seed URLs are already sized (?w=800), and this way
    // images do not depend on the container having outbound internet access.
    unoptimized: true,
  },
};

export default nextConfig;
