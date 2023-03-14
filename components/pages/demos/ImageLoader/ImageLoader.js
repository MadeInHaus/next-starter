import * as React from 'react';
import cx from 'clsx';

import { useIntersectionObserver, useImagePreload } from '@madeinhaus/hooks';

import grid from 'styles/modules/grid.module.scss';
import styles from './ImageLoader.module.scss';

const ImageLoader = ({ dogs }) => {
    return (
        <div className={cx(styles.root, grid.container)}>
            <div className={styles.dogs}>
                {dogs.map((dog, i) => (
                    <LazyImage key={i} url={dog} />
                ))}
            </div>
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
                src={inView ? url : undefined}
                className={cx(styles.image, { [styles.loaded]: loaded })}
                alt=""
            />
        </div>
    );
};

export default ImageLoader;
