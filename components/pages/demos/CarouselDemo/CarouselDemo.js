import PropTypes from 'prop-types';
import cx from 'classnames';

import { mappable } from 'utils';

import useIntersectionObserver from 'hooks/useIntersectionObserver';
import useImageLoader from 'hooks/useImageLoader';

import Text from 'components/ui/Text';
import Carousel from 'components/ui/Carousel';

import grid from 'styles/modules/grid.module.scss';
import styles from './CarouselDemo.module.scss';

const lorem = `Lorem ipsum dolor sit amet consectetur adipiscing elit In vulputate lorem id leo rhoncus auctor placerat lorem ornare Donec sed urna vehicula vestibulum arcu quis tristique massa`;

const CarouselDemo = ({ className }) => {
    return (
        <div className={cx(styles.root, className)}>
            <section className={styles.section}>
                <div className={grid.container}>
                    <Text as="h1" className={styles.headline}>
                        Infinite, variable width items, centered, snap
                    </Text>
                </div>
                <Carousel
                    snap
                    infinite
                    align="center"
                    className={styles.carouselText}
                >
                    {lorem.split(' ').map((word, i) => (
                        <div key={i}>{word}</div>
                    ))}
                </Carousel>
            </section>
            <section className={styles.section}>
                <div className={grid.container}>
                    <Text as="h1" className={styles.headline}>
                        Infinite, fixed width items, left aligned, snap
                    </Text>
                </div>
                <Carousel snap infinite className={styles.carouselKittens}>
                    {mappable(8).map(i => (
                        <KittenImage i={i} key={i} />
                    ))}
                </Carousel>
            </section>
        </div>
    );
};

const KittenImage = ({ i }) => {
    const [inView, intersectionRef] = useIntersectionObserver();
    const [loaded, loadRef] = useImageLoader();
    return (
        <div ref={intersectionRef} className={styles.itemKittens}>
            <img
                ref={loadRef}
                src={inView ? `/assets/images/kitten/kitten-0${i}.jpg` : null}
                className={cx(styles.imageKittens, { [styles.loaded]: loaded })}
                draggable="false"
                alt=""
            />
        </div>
    );
};

CarouselDemo.propTypes = {
    className: PropTypes.string,
};

export default CarouselDemo;
