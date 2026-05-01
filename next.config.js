
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development' // 开发环境禁用，生产环境启用
})

module.exports = withPWA({
  reactStrictMode: true,
})