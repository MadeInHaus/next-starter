'use client';

import 'styles/global/index.scss';

import NextHead from 'next/head';
import Header from 'components/ui/Header';
import GridOverlay from 'components/ui/GridOverlay';

import { ThemeProvider } from '@madeinhaus/nextjs-theme';

// prettier-ignore
const Head = () => (
  <NextHead>
      <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      <meta name="theme-color" media="(prefers-color-scheme: light)" content="#9e9e9e" />
      <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#454545" />
      <link rel="icon" href="/favicon.svg" />
  </NextHead>
);

export default function RootLayout({ children }) {
    return (
        <ThemeProvider>
            <html lang="en">
                <body>
                    <Head />
                    <Header />
                    {children}
                    <GridOverlay />
                </body>
            </html>
        </ThemeProvider>
    );
}
