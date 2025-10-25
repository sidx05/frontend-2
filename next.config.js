/**
 * Next.js config: mark server-only modules as external so webpack doesn't try to bundle them
 * This prevents "Can't resolve 'mongoose'" during the build in CI when mongoose should be
 * required at runtime on the server instead of bundled into the build.
 */
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // For server build, treat mongoose as external (leave require('mongoose') as runtime require)
    if (isServer) {
      // Ensure externals is an array we can push into
      if (!config.externals) config.externals = [];
      // If externals is a function or array, add mongoose as a commonjs external
      try {
        config.externals.push('mongoose');
      } catch (e) {
        // ignore
      }
    } else {
      // For client builds, avoid resolving mongoose entirely
      config.resolve = config.resolve || {};
      config.resolve.fallback = Object.assign({}, config.resolve.fallback || {}, {
        mongoose: false
      });
    }

    return config;
  }
};

module.exports = nextConfig;
