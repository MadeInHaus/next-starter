import { useState } from 'react';

import Text from 'components/ui/Text';

import { useIntersectionObserver } from '@madeinhaus/core';

import styles from './IntersectionObserver.module.scss';

const IntersectionObserver = () => {
    const [once, setOnce] = useState(true);
    const [inView, ref] = useIntersectionObserver({ once });
    return (
        <div className={styles.root}>
            <div className={styles.header}>
                <Text
                    as="button"
                    className={styles.button}
                    onClick={() => setOnce(!once)}
                >
                    toggle &quot;once&quot;
                </Text>
                <Text>once: {once.toString()}</Text>
                <Text>inView: {inView.toString()}</Text>
            </div>
            <div ref={ref} id="anchor" className={styles.intersectingElement} />
        </div>
    );
};

export default IntersectionObserver;
