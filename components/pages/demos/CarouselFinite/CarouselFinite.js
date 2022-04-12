import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import { mappable } from 'utils';
import { getCSSValues } from 'components/ui/Carousel/utils';

import useEffectAfterFirstRender from './useEffectAfterFirstRender';
import useIntersectionObserver from 'hooks/useIntersectionObserver';
import useImageLoader from 'hooks/useImageLoader';

import Text from 'components/ui/Text';
import Carousel from 'components/ui/Carousel';

import grid from 'styles/modules/grid.module.scss';
import styles from './CarouselFinite.module.scss';

const widths = [271, 446, 304, 319, 445, 554, 236, 525];

const CarouselDemo = ({ className }) => {
    const ref = useRef();
    const carousel = useRef();
    const [align, setAlign] = useState('start');
    const [snapPosition, setSnapPosition] = useState('var(--grid-margin)');
    const [activeItemIndex, setActiveItemIndex] = useState(2);
    const [infinite, setInfinite] = useState(false);
    const [randomWidths, setRandomWidths] = useState(true);

    const setLineLabels = () => {
        const values = getCSSValues(ref.current);
        const snapPos = values.snap || 0;
        const snapPosStart = values.snapStart || snapPos;
        const snapPosEnd = values.snapEnd || snapPos;
        ref.current.dataset.start = `${snapPosStart}px`;
        ref.current.dataset.end = `${snapPosEnd}px`;
    };

    useEffect(() => {
        setLineLabels();
        window.addEventListener('resize', setLineLabels);
        return () => window.removeEventListener('resize', setLineLabels);
    }, []);

    useEffectAfterFirstRender(() => {
        setLineLabels();
        carousel.current.refresh();
    }, [randomWidths, snapPosition]);

    const handleAlignChange = event => {
        const align = event.target.value;
        const isCenter = align === 'center';
        setAlign(align);
        setSnapPosition(isCenter ? 'calc(50% - 10rem)' : 'var(--grid-margin)');
    };

    const handleActiveItemIndexChange = event => {
        setActiveItemIndex(+event.target.value);
    };

    const handleInfiniteChange = event => {
        setInfinite(event.target.checked);
    };

    const handleRandomWidthsChange = event => {
        setRandomWidths(event.target.checked);
    };

    const style = {
        '--carousel-snap-position': snapPosition,
        '--carousel-item-width': randomWidths ? 0 : 'var(--kitten-item-width)',
    };

    return (
        <div className={cx(styles.root, className)} style={style}>
            <section className={styles.section}>
                <div className={grid.container}>
                    <Text as="h1" className={styles.headline}>
                        Playground
                    </Text>
                    <Form
                        align={align}
                        activeItemIndex={activeItemIndex}
                        infinite={infinite}
                        randomWidths={randomWidths}
                        onAlignChange={handleAlignChange}
                        onActiveItemIndexChange={handleActiveItemIndexChange}
                        onInfiniteChange={handleInfiniteChange}
                        onRandomWidthsChange={handleRandomWidthsChange}
                    />
                </div>
                <div className={styles.lines} />
                <div
                    ref={ref}
                    data-start=""
                    data-end=""
                    className={styles.labels}
                />
                <Carousel
                    snap
                    align={align}
                    infinite={infinite}
                    activeItemIndex={activeItemIndex}
                    className={styles.carouselKittens}
                    ref={carousel}
                >
                    {mappable(8).map(i => (
                        <KittenImage
                            i={i}
                            key={i}
                            randomWidths={randomWidths}
                        />
                    ))}
                </Carousel>
            </section>
        </div>
    );
};

const KittenImage = ({ i, randomWidths }) => {
    const [inView, intersectionRef] = useIntersectionObserver();
    const [loaded, loadRef] = useImageLoader();
    const style = {
        width: randomWidths ? `${widths[i % 8]}px` : 'var(--kitten-item-width)',
    };
    return (
        <div ref={intersectionRef} className={styles.itemKittens} style={style}>
            <img
                ref={loadRef}
                src={inView ? `/assets/images/kitten/kitten-0${i}.jpg` : null}
                className={cx(styles.imageKittens, { [styles.loaded]: loaded })}
                draggable="false"
                alt=""
            />
            <div className={styles.index}>{i}</div>
        </div>
    );
};

const Form = ({
    align,
    activeItemIndex,
    infinite,
    randomWidths,
    onAlignChange,
    onActiveItemIndexChange,
    onInfiniteChange,
    onRandomWidthsChange,
}) => {
    return (
        <form className={styles.form}>
            <select
                className={styles.select}
                onChange={onAlignChange}
                value={align}
            >
                <optgroup label="align">
                    <option value="start">start</option>
                    <option value="center">center</option>
                    <option value="end">end</option>
                </optgroup>
            </select>
            <select
                className={styles.select}
                onChange={onActiveItemIndexChange}
                value={activeItemIndex}
            >
                <optgroup label="activeIndex">
                    {mappable(8).map(i => (
                        <option key={i} value={i}>
                            {i}
                        </option>
                    ))}
                </optgroup>
            </select>
            <span className={styles.select}>
                <input
                    id="infiniteCheckbox"
                    type="checkbox"
                    checked={infinite}
                    onChange={onInfiniteChange}
                />
                <label htmlFor="infiniteCheckbox">infinite</label>
            </span>
            <span className={styles.select}>
                <input
                    id="widthsCheckbox"
                    type="checkbox"
                    checked={randomWidths}
                    onChange={onRandomWidthsChange}
                />
                <label htmlFor="widthsCheckbox">random widths</label>
            </span>
        </form>
    );
};

CarouselDemo.propTypes = {
    className: PropTypes.string,
};

export default CarouselDemo;
