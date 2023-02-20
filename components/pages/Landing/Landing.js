import { useTheme } from 'components/misc/Theme';

import Head from 'components/misc/Head';
import Link from 'components/ui/Link';
import Text from 'components/ui/Text';

import styles from './Landing.module.scss';

const Landing = () => {
    const { theme, setTheme } = useTheme();

    const handleThemeClick = theme => () => {
        setTheme(theme);
    };

    return (
        <div className={styles.root}>
            <Head
                title="HAUS Next.js Starter"
                description="A skeleton Next.js app to quickly get started."
            />
            <section className={styles.section}>
                <Text as="h2" className={styles.sectionHeadline}>
                    Demos
                </Text>
                <ul>
                    <li>
                        <Link href="/demos/carousel">
                            <Text as="span">Carousel</Text>
                        </Link>
                    </li>
                    <li>
                        <Link href="/demos/image-loader">
                            <Text as="span">useImageLoader</Text>
                        </Link>
                    </li>
                    <li>
                        <Link href="/demos/intersection-observer">
                            <Text as="span">useIntersectionObserver</Text>
                        </Link>
                    </li>
                    <li>
                        <Link href="/demos/intersection-observer#anchor">
                            <Text as="span">
                                useIntersectionObserver (anchor)
                            </Text>
                        </Link>
                    </li>
                </ul>
            </section>
            <section className={styles.section}>
                <Text as="h2" className={styles.sectionHeadline}>
                    Theming
                </Text>
                <ul>
                    <li>
                        <button
                            onClick={handleThemeClick('auto')}
                            disabled={theme === 'auto'}
                            className={styles.themeButton}
                        >
                            auto
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={handleThemeClick('light')}
                            disabled={theme === 'light'}
                            className={styles.themeButton}
                        >
                            light
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={handleThemeClick('dark')}
                            disabled={theme === 'dark'}
                            className={styles.themeButton}
                        >
                            dark
                        </button>
                    </li>
                </ul>
            </section>
        </div>
    );
};

export default Landing;
