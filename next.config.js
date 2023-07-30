const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
    prependData: `@import "0.variables.scss";`
  },
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig
