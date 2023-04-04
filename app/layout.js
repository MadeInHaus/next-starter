'use client';

import 'styles/global/index.scss';

import Header from 'components/ui/Header';
import GridOverlay from 'components/ui/GridOverlay';

import { ThemeProvider } from '@madeinhaus/nextjs-theme';

export default function RootLayout({ children }) {
    return (
        <ThemeProvider>
            <html lang="en">
                <body>
                    <Header />
                    {children}
                    <GridOverlay />
                </body>
            </html>
        </ThemeProvider>
    );
}
