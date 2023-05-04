'use client';

import 'styles/global/index.scss';

import Header from 'components/ui/Header';
import GridOverlay from 'components/ui/GridOverlay';

import PageTransition, {
    PageTransitionContext,
    useAsPathWithoutHash,
} from '@madeinhaus/nextjs-page-transition';
import { ThemeProvider } from '@madeinhaus/nextjs-theme';

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <PageTransitionContext>
                    <ThemeProvider>
                        <Header />
                        {/* <PageTransition> */}
                        {children}
                        {/* </PageTransition> */}
                        <GridOverlay />
                    </ThemeProvider>
                </PageTransitionContext>
            </body>
        </html>
    );
}
