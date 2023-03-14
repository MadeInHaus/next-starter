import * as React from 'react';
import cx from 'clsx';

import Text from 'components/ui/Text';

import { useIntersectionObserver } from '@madeinhaus/hooks';

import grid from 'styles/modules/grid.module.scss';
import styles from './IntersectionObserver.module.scss';

const IntersectionObserver = () => {
    const [once, setOnce] = React.useState(true);
    const [inView, ref] = useIntersectionObserver({ once });
    return (
        <div className={styles.root}>
            <div className={styles.controls}>
                <Text as="button" className={styles.button} onClick={() => setOnce(!once)}>
                    {`Toggle 'once' ${once ? 'OFF' : 'ON'}`}
                </Text>
                <Text>{`once: ${once ? 'ON' : 'OFF'}`}</Text>
                <Text>{`inView: ${inView ? 'YES' : 'NO'}`}</Text>
            </div>
            <div className={cx(styles.intersectingElementContainer, grid.container)}>
                <div ref={ref} id="anchor" className={styles.intersectingElement} />
            </div>
        </div>
    );
};

export default IntersectionObserver;
