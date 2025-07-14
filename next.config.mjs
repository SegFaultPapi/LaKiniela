/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Suprimir warnings específicos de React relacionados con errorCorrection
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }

    // Suprimir warnings de props no reconocidas por React
    if (config.infrastructureLogging) {
      config.infrastructureLogging.level = 'error'
    } else {
      config.infrastructureLogging = { level: 'error' }
    }

    return config
  },
  experimental: {
    // Suprimir warnings específicos de React 19
    suppressHydrationWarning: true,
  },
}

export default nextConfig
