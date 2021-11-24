import cx from 'classnames';

import { mappable } from 'utils';

import useIntersectionObserver from 'hooks/useIntersectionObserver';
import useImageLoader from 'hooks/useImageLoader';

import styles from './ImageLoader.module.scss';

const ImageLoader = () => {
    return (
        <div className={styles.root}>
            {mappable(10).map(i => (
                <LazyImage key={i} />
            ))}
        </div>
    );
};

const LazyImage = () => {
    const [inView, intersectionRef] = useIntersectionObserver();
    const [loaded, loadRef] = useImageLoader();
    return (
        <div ref={intersectionRef}>
            <img
                ref={loadRef}
                width={640}
                height={480}
                src={inView ? 'http://placeimg.com/640/480/animals' : null}
                className={cx(styles.image, { [styles.loaded]: loaded })}
                alt=""
            />
        </div>
    );
};

export default ImageLoader;
