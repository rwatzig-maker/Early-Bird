const csp = [
  "default-src 'self'",
  // Next.js static hydration and GA use inline scripts. No unsafe-eval is allowed.
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://analytics.google.com https://*.analytics.google.com https://www.googletagmanager.com https://challenges.cloudflare.com",
  "frame-src https://challenges.cloudflare.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join('; ');
export default {
  poweredByHeader: false,
  images: {unoptimized:true}, // Existing images are direct pre-optimized assets.
  async headers() {
    return [{source: '/:path*', headers: [
      {key: 'Content-Security-Policy', value: csp},
      {key: 'X-Frame-Options', value: 'DENY'},
      {key: 'X-Content-Type-Options', value: 'nosniff'},
      {key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin'},
      {key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()'},
    ]}];
  },
};
