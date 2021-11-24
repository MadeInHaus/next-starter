// Resets, global styles
import 'styles/global/reset.scss';
import 'styles/global/theme.scss';

// Global CSS variable definitions
import 'styles/global/grid.scss';
import 'styles/global/colors.scss';
import 'styles/global/animations.scss';
import 'styles/global/misc.scss';

import cx from 'classnames';
import { useRouter } from 'next/router';
import { removeHash } from 'utils';

import useNextCssRemovalPrevention from 'hooks/useNextCssRemovalPrevention';
import useTouchDetection from 'hooks/useTouchDetection';
import useFontLoader from 'hooks/useFontLoader';
import { useTransitionState } from 'hooks/usePageTransitionStore';

import NextHead from 'next/head';

import PageTransition from 'components/ui/PageTransition';
import GridOverlay from 'components/ui/GridOverlay';

import styles from 'styles/modules/app.module.scss';

const fontFamilies = [
    'neue-haas-grotesk-display:n7',
    'neue-haas-grotesk-text:n4,n5,n7',
    'interstate-mono:n4',
];

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
    const router = useRouter();

    useNextCssRemovalPrevention();
    useFontLoader(fontFamilies);
    useTouchDetection();

    const { phase } = useTransitionState();
    const transitionClass = cx(styles.main, styles[`transition-${phase}`]);

    return (
        <>
            <Head />
            <PageTransition className={transitionClass}>
                <Component {...pageProps} key={removeHash(router.asPath)} />
            </PageTransition>
            <GridOverlay />
        </>
    );
}

export default App;
