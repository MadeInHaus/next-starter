import { useState, useRef, useEffect, StrictMode } from 'react';
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

const CarouselFinite = ({ className }) => {
    const ref = useRef();
    const carousel = useRef();
    const [align, setAlign] = useState('start');
    const [snapPosition, setSnapPosition] = useState('var(--grid-margin)');
    const [activeItemIndex, setActiveItemIndex] = useState(1);
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

    const handleDummyClick = event => {
        event.preventDefault();
        carousel.current.moveIntoView(6);
    };

    const style = {
        '--carousel-snap-position': snapPosition,
        '--carousel-item-width': randomWidths ? 0 : 'var(--kitten-item-width)',
    };

    return (
        <StrictMode>
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
                            onActiveItemIndexChange={
                                handleActiveItemIndexChange
                            }
                            onInfiniteChange={handleInfiniteChange}
                            onRandomWidthsChange={handleRandomWidthsChange}
                            onDummyClick={handleDummyClick}
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
        </StrictMode>
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
    onDummyClick,
}) => {
    return (
        <form className={styles.form}>
            <span className={styles.select}>
                <label htmlFor="alignSelect">align:</label>
                <select id="alignSelect" onChange={onAlignChange} value={align}>
                    <option value="start">start</option>
                    <option value="center">center</option>
                    <option value="end">end</option>
                </select>
            </span>
            <span className={styles.select}>
                <label htmlFor="activeItemSelect">activeItem:</label>
                <select
                    id="activeItemSelect"
                    onChange={onActiveItemIndexChange}
                    value={activeItemIndex}
                >
                    {mappable(8).map(i => (
                        <option key={i} value={i}>
                            {i}
                        </option>
                    ))}
                </select>
            </span>
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
            <span className={styles.select}>
                <button onClick={onDummyClick}>Click to move to 6</button>
            </span>
        </form>
    );
};

CarouselFinite.propTypes = {
    className: PropTypes.string,
};

export default CarouselFinite;
