// https://beta.nextjs.org/docs/api-reference/metadata

const title = 'HAUS Next.js Starter';
const description = 'A skeleton Next.js app to quickly get started.';

export const metadata = {
    title,
    description,
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: '#9e9e9e' },
        { media: '(prefers-color-scheme: dark)', color: '#454545' },
    ],
    viewport: {
        width: 'device-width',
        initialScale: 1,
        viewportFit: 'cover',
    },
    openGraph: {
        title,
        description,
        url: 'https://next-starter-omega.vercel.app/',
        siteName: 'HAUS Next.JS Starter',
        images: [
            {
                url: 'https://nextjs.org/og.png',
                width: 800,
                height: 600,
            },
            {
                url: 'https://nextjs.org/og-alt.png',
                width: 1800,
                height: 1600,
                alt: 'My custom alt',
            },
        ],
        locale: 'en-US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title,
        description,
        creator: '@madeinhaus',
        images: ['https://nextjs.org/og.png'],
    },
};

export { default } from 'components/pages/Landing';
