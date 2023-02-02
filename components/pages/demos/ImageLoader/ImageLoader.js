import * as React from 'react';
import cx from 'classnames';

import { useIntersectionObserver, useImagePreload } from '@madeinhaus/core';

import styles from './ImageLoader.module.scss';

const ImageLoader = ({ dogs }) => {
    return (
        <div className={styles.root}>
            {dogs.map((dog, i) => (
                <LazyImage key={i} url={dog} />
            ))}
        </div>
    );
};

const LazyImage = ({ url }) => {
    const [inView, intersectionRef] = useIntersectionObserver();
    const [loaded, loadRef] = useImagePreload();
    return (
        <div ref={intersectionRef} className={styles.imageWrapper}>
            <img
                ref={loadRef}
                src={inView ? url : null}
                className={cx(styles.image, { [styles.loaded]: loaded })}
                alt=""
            />
        </div>
    );
};

export default ImageLoader;
