import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Emits a self-contained server bundle, so the runtime image needs no
  // node_modules and stays small.
  output: 'standalone',
  images: {
    // Images are same-origin (/media/<key>, proxied to object storage), so no
    // remote hosts need allowing. Optimisation is off because the stored files
    // are already sized for display.
    unoptimized: true,
  },
  experimental: {
    serverActions: {
      // The create form submits the photo through a server action, and the
      // default cap is 1 MB — well under the 5 MB the API accepts, so a valid
      // upload would be rejected before it ever reached the API.
      bodySizeLimit: '6mb',
    },
  },
};

export default nextConfig;
