import * as React from 'react';
import cx from 'clsx';

import { useIntersectionObserver } from '@madeinhaus/hooks';

import grid from 'styles/modules/grid.module.scss';
import styles from './IntersectionObserver.module.scss';

const IntersectionObserver = () => {
    const [once, setOnce] = React.useState(true);
    const [inView, ref] = useIntersectionObserver({ once });
    return (
        <div className={styles.root}>
            <div className={styles.controls}>
                <button
                    as="button"
                    className={cx(styles.button, 'body')}
                    onClick={() => setOnce(!once)}
                >
                    {`Toggle 'once'`}
                </button>
                <p>{`once: ${once ? 'ON' : 'OFF'}`}</p>
                <p>{`inView: ${inView ? 'YES' : 'NO'}`}</p>
            </div>
            <div className={cx(styles.intersectingElementContainer, grid.container)}>
                <div ref={ref} id="anchor" className={styles.intersectingElement} />
            </div>
        </div>
    );
};

export default IntersectionObserver;
