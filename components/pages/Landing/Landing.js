import cx from 'clsx';

import { useTheme } from '@madeinhaus/nextjs-theme';
import { Link } from '@madeinhaus/nextjs-page-transition';
import Head from 'components/misc/Head';

import grid from 'styles/modules/grid.module.scss';
import styles from './Landing.module.scss';

// prettier-ignore
const demoLinks = [
    { href: '/demos/carousel', label: 'Carousel' },
    { href: '/demos/image-loader', label: 'UseImageLoader' },
    { href: '/demos/intersection-observer', label: 'UseIntersectionObserver' },
    { href: '/demos/intersection-observer#anchor', label: 'UseIntersectionObserver (anchor)' },
];

const Landing = () => {
    const { theme, setTheme } = useTheme() ?? {};

    const handleThemeClick = theme => () => {
        setTheme?.(theme);
    };

    return (
        <div className={cx(styles.root, grid.container)}>
            <Head
                title="HAUS Next.js Starter"
                description="A skeleton Next.js app to quickly get started."
            />
            <section className={styles.section}>
                <h2 className={cx(styles.sectionHeadline, 'body')}>
                    Demos
                </h2>
                <ul className={styles.links}>
                    {demoLinks.map(({ href, label }, i) => (
                        <li key={i} className={styles.link}>
                            <Link href={href}>
                                <span>{label}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </section>
            <section className={styles.section}>
                <h2 className={cx(styles.sectionHeadline, 'body')}>
                    Theme
                </h2>
                <ul>
                    {['auto', 'light', 'dark'].map(themeValue => (
                        <li key={themeValue}>
                            <button
                                onClick={handleThemeClick(themeValue)}
                                disabled={themeValue === theme}
                                className={styles.themeButton}
                            >
                                {themeValue}
                            </button>
                        </li>
                    ))}
                </ul>
            </section>
            <section className={styles.section}>
                <h2 className={cx(styles.sectionHeadline, 'body')}>
                    Source
                </h2>
                <ul>
                    <li className={styles.link}>
                        <Link href="https://github.com/MadeInHaus/next-starter">
                            <span>
                                https://github.com/MadeInHaus/next-starter
                            </span>
                        </Link>
                    </li>
                </ul>
            </section>
        </div>
    );
};

export default Landing;
