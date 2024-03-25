const securityHeaders = [
    {
        key: 'X-Frame-Options',
        value: 'SAMEORIGIN',
    },
    {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
    },
    {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin',
    },
    {
        key: 'X-XSS-Protection',
        value: '1; mode=block',
    },
    {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=()',
    },
    {
        key: 'X-DNS-Prefetch-Control',
        value: 'on',
    },
];

module.exports = {
    poweredByHeader: false,
    async headers() {
        const headers = [
            {
                source: '/(.*)',
                headers: securityHeaders,
            },
        ];
        if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview') {
            headers.push({
                source: '/:path*',
                headers: [
                    {
                        key: 'X-Robots-Tag',
                        value: 'noindex',
                    },
                ],
            });
        }
        return headers;
    },
};
