import * as React from 'react';
import cx from 'clsx';

import Text from 'components/ui/Text';

import {
    Link,
    usePageTransitionState,
} from '@madeinhaus/nextjs-page-transition';

import grid from 'styles/modules/grid.module.scss';
import styles from './Header.module.scss';

const Header = ({ className }) => {
    const { phase } = usePageTransitionState();
    return (
        <div className={cx(styles.root, className)}>
            <div className={cx(styles.container, grid.container)}>
                <Text className={styles.home} as="h1">
                    <Link href="/">HAUS Next.JS Starter</Link>
                </Text>
                <Text className={styles.phase}>
                    <span className={styles.phasePrefix}>
                        PageTransitionPhase.
                    </span>
                    {phase}
                </Text>
            </div>
        </div>
    );
};

export default Header;
