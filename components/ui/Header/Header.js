import * as React from 'react';
import cx from 'clsx';

import { Link, usePageTransitionState } from '@madeinhaus/nextjs-page-transition';

import styles from './Header.module.css';

const Header = ({ className }) => {
    const { phase } = usePageTransitionState();
    return (
        <div className={cx(styles.root, className)}>
            <div className={cx(styles.container, 'grid')}>
                <h1 className={cx(styles.home, 'body')}>
                    <Link href="/">HAUS Next.JS Starter</Link>
                </h1>
                <p className={cx(styles.phase, 'body')}>
                    <span className={styles.phasePrefix}>PageTransitionPhase.</span>
                    {phase}
                </p>
            </div>
        </div>
    );
};

export default Header;
