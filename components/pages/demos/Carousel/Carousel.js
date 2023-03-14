import cx from 'clsx';

import Carousel from '@madeinhaus/carousel';
import { useIntersectionObserver, useImagePreload } from '@madeinhaus/hooks';

import styles from './Carousel.module.scss';

const CarouselDemo = ({ dogs }) => {
    return (
        <div className={styles.root}>
            <Carousel className={styles.carousel} itemClassName={styles.item}>
                {dogs.map((dog, i) => (
                    <LazyImage key={i} index={i} url={dog} />
                ))}
            </Carousel>
        </div>
    );
};

const LazyImage = ({ url, index }) => {
    const [inView, intersectionRef] = useIntersectionObserver();
    const [loaded, loadRef] = useImagePreload();
    return (
        <div ref={intersectionRef} className={styles.itemContainer}>
            <div className={styles.index}>{index}</div>
            <img
                ref={loadRef}
                src={inView ? url : undefined}
                className={cx(styles.image, { [styles.loaded]: loaded })}
                alt=""
            />
        </div>
    );
};

export default CarouselDemo;
