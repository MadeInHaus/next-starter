import cx from 'clsx';

import { useTheme } from '@madeinhaus/nextjs-theme';
import { Link } from '@madeinhaus/nextjs-page-transition';
import Text from 'components/ui/Text';

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
            <section className={styles.section}>
                <Text as="h2" className={styles.sectionHeadline}>
                    Demos
                </Text>
                <ul className={styles.links}>
                    {demoLinks.map(({ href, label }, i) => (
                        <li key={i} className={styles.link}>
                            <Link href={href}>
                                <Text as="span">{label}</Text>
                            </Link>
                        </li>
                    ))}
                </ul>
            </section>
            <section className={styles.section}>
                <Text as="h2" className={styles.sectionHeadline}>
                    Theme
                </Text>
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
                <Text as="h2" className={styles.sectionHeadline}>
                    Source
                </Text>
                <ul>
                    <li className={styles.link}>
                        <Link href="https://github.com/MadeInHaus/next-starter">
                            <Text as="span">
                                https://github.com/MadeInHaus/next-starter
                            </Text>
                        </Link>
                    </li>
                </ul>
            </section>
        </div>
    );
};

export default Landing;
