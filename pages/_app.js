// Resets, global styles
import 'styles/global/reset.scss';
import 'styles/global/theme.scss';

// Global CSS variable definitions
import 'styles/global/grid.scss';
import 'styles/global/colors.scss';
import 'styles/global/animations.scss';
import 'styles/global/misc.scss';

import NextHead from 'next/head';
import Header from 'components/ui/Header';
import GridOverlay from 'components/ui/GridOverlay';

import { ThemeProvider } from 'components/misc/Theme';

import PageTransition, {
    PageTransitionContext,
    useAsPathWithoutHash,
} from '@madeinhaus/nextjs-page-transition';

import styles from 'styles/modules/app.module.scss';

// prettier-ignore
const Head = () => (
    <NextHead>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#9e9e9e" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#454545" />
        <link rel="icon" href="/favicon.svg" />
    </NextHead>
);

function App({ Component, pageProps }) {
    return (
        <ThemeProvider>
            <Head />
            <PageTransitionContext>
                <Header />
                <PageTransition className={styles.main}>
                    <Component {...pageProps} key={useAsPathWithoutHash()} />
                </PageTransition>
                <GridOverlay />
            </PageTransitionContext>
        </ThemeProvider>
    );
}

export default App;
