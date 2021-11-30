import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import { mappable } from 'utils';

import Text from 'components/ui/Text';
import Carousel from 'components/ui/Carousel';

import styles from './CarouselDemo.module.scss';

const lorem = `Lorem ipsum dolor sit amet consectetur adipiscing elit In vulputate lorem id leo rhoncus auctor placerat lorem ornare Donec sed urna vehicula vestibulum arcu quis tristique massa`;

const CarouselDemo = ({ className }) => {
    return (
        <div className={cx(styles.root, className)}>
            <section className={styles.section}>
                <Text as="h1" className={styles.headline}>
                    Infinite Carousel, fixed width items, left aligned
                </Text>
                <Carousel infinite align="start" className={styles.carousel1}>
                    {mappable(8).map(i => (
                        <div className={styles.itemKittens} key={i}>
                            <img
                                className={styles.imageKittens}
                                src={`/assets/images/kitten/kitten-0${i}.jpg`}
                                alt=""
                            />
                        </div>
                    ))}
                </Carousel>
            </section>
            <section className={styles.section}>
                <Text as="h1" className={styles.headline}>
                    Finite Carousel, fixed width items, left aligned
                </Text>
                <Carousel className={styles.carousel2}>
                    {mappable(8).map(i => (
                        <div className={styles.itemKittens} key={i}>
                            <img
                                className={styles.imageKittens}
                                src={`/assets/images/kitten/kitten-0${i}.jpg`}
                                alt=""
                            />
                        </div>
                    ))}
                </Carousel>
            </section>
            <section className={styles.section}>
                <Text as="h1" className={styles.headline}>
                    Infinite Carousel, variable width items, centered
                </Text>
                <Carousel infinite align="center" className={styles.carousel3}>
                    {lorem.split(' ').map((word, i) => (
                        <div className={styles.itemText} key={i}>
                            {word}
                        </div>
                    ))}
                </Carousel>
            </section>
        </div>
    );
};

CarouselDemo.propTypes = {
    className: PropTypes.string,
};

export default CarouselDemo;
