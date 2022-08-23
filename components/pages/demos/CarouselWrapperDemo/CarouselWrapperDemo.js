import { useState, useRef, useEffect, useCallback, StrictMode } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import { useMedia } from 'react-use';
import { mappable } from 'utils';
import { getCSSValues } from 'components/ui/Carousel/utils';

import useEffectAfterFirstRender from './useEffectAfterFirstRender';
import useIntersectionObserver from 'hooks/useIntersectionObserver';
import useImageLoader from 'hooks/useImageLoader';

import Text from 'components/ui/Text';
import CarouselWrapper from 'components/ui/CarouselWrapper';
import DotNav from 'components/ui/CarouselWrapper/DotNav';
import ArrowNav from 'components/ui/CarouselWrapper/ArrowNav';

import grid from 'styles/modules/grid.module.scss';
import styles from './CarouselWrapperDemo.module.scss';

const widths = [271, 446, 304, 319, 445, 554, 236, 525];
const globalMaxWidth = 1280;

const CarouselWrapperDemo = ({ className }) => {
    const gridRef = useRef();
    const labelRef = useRef();
    const carouselRef = useRef();
    const [align, setAlign] = useState('start');
    const [snapPosition, setSnapPosition] = useState('var(--grid-margin)');
    const [activeItemIndex, setActiveItemIndex] = useState(0);
    const [infinite, setInfinite] = useState(false);
    const [randomWidths, setRandomWidths] = useState(false);
    const [offsetLeft, setOffsetLeft] = useState(false);
    const [maxWidth, setMaxWidth] = useState(true);
    const [visibleItems, setVisibleItems] = useState(1);

    const isLarge = useMedia(`(min-width: 1280px)`, true);
    const isXLarge = useMedia(`(min-width: 1920px)`, true);

    const maxWidthSnapPosition = `calc(${offsetLeft}px)`;

    const setAlignAndSnapPosition = useCallback(
        align => {
            const isCenter = align === 'center';
            setAlign(align);
            setSnapPosition(
                isCenter
                    ? '50%'
                    : maxWidth
                    ? maxWidthSnapPosition
                    : 'var(--grid-margin)'
            );
        },
        [maxWidth, maxWidthSnapPosition]
    );

    const resize = useCallback(() => {
        const offset = gridRef.current.offsetLeft;
        setOffsetLeft(offset);
        setLineLabels();
        setAlignAndSnapPosition(align);
        setVisibleItems(isLarge ? 3 : 1);

        // adjusting the visible items to update arrow and dot nav appropriately with max width
        if (maxWidth && gridRef.current.offsetWidth >= globalMaxWidth) {
            setVisibleItems(isXLarge ? 1 : isLarge ? 2 : 1);
        }
    }, [setAlignAndSnapPosition, maxWidth, isXLarge, align, isLarge]);

    const setLineLabels = () => {
        const values = getCSSValues(labelRef.current);
        const snapPos = values.snap || 0;
        const snapPosStart = values.snapStart || snapPos;
        const snapPosEnd = values.snapEnd || snapPos;
        labelRef.current.dataset.start = `${snapPosStart}px`;
        labelRef.current.dataset.end = `${snapPosEnd}px`;
    };

    useEffect(() => {
        resize();
        window.addEventListener('resize', resize);
        return () => window.removeEventListener('resize', resize);
    }, [resize]);

    useEffectAfterFirstRender(() => {
        setLineLabels();
        carouselRef.current.refresh();
    }, [randomWidths, snapPosition]);

    const handleAlignChange = event => {
        const align = event.target.value;
        setAlignAndSnapPosition(align);
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

    const handleMaxWidthChange = event => {
        setMaxWidth(event.target.checked);
    };

    const style = {
        '--carousel-snap-position': snapPosition,
        '--carousel-item-width': randomWidths ? 0 : 'var(--kitten-item-width)',
    };

    return (
        <StrictMode>
            <div
                className={cx(styles.root, className, {
                    [styles.maxWidth]: maxWidth,
                })}
                style={style}
            >
                <section className={styles.section}>
                    <div
                        ref={gridRef}
                        className={cx(grid.container, styles.grid)}
                    >
                        <Text as="h1" className={styles.headline}>
                            Carousel Wrapper
                        </Text>
                        <Form
                            align={align}
                            activeItemIndex={activeItemIndex}
                            infinite={infinite}
                            randomWidths={randomWidths}
                            maxWidth={maxWidth}
                            onAlignChange={handleAlignChange}
                            onActiveItemIndexChange={
                                handleActiveItemIndexChange
                            }
                            onInfiniteChange={handleInfiniteChange}
                            onRandomWidthsChange={handleRandomWidthsChange}
                            onMaxWidthChange={handleMaxWidthChange}
                        />
                    </div>
                    <div className={styles.lines} />
                    <div
                        ref={labelRef}
                        data-start=""
                        data-end=""
                        className={styles.labels}
                    />
                    <div className={styles.carouselWrapper}>
                        <CarouselWrapper
                            ref={carouselRef}
                            snap
                            align={align}
                            infinite={infinite}
                            activeItemIndex={activeItemIndex}
                            className={styles.carouselKittens}
                            visibleItems={visibleItems}
                            navComponent={props => (
                                <>
                                    <DotNav
                                        {...props}
                                        className={styles.dotNav}
                                    />
                                    <ArrowNav
                                        {...props}
                                        className={styles.arrowNav}
                                    />
                                </>
                            )}
                        >
                            {mappable(8).map(i => (
                                <KittenImage
                                    i={i}
                                    key={i}
                                    randomWidths={randomWidths}
                                />
                            ))}
                        </CarouselWrapper>
                    </div>
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
    maxWidth,
    onMaxWidthChange,
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
            <span className={styles.select} style={{ opacity: 0.35 }}>
                infinite coming soon
                {/* <input
                    id="infiniteCheckbox"
                    type="checkbox"
                    checked={infinite}
                    onChange={onInfiniteChange}
                />
                <label htmlFor="infiniteCheckbox">infinite</label> */}
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
                <input
                    id="maxWidthCheckbox"
                    type="checkbox"
                    checked={maxWidth}
                    onChange={onMaxWidthChange}
                />
                <label htmlFor="maxWidthCheckbox">max width</label>
            </span>
        </form>
    );
};

CarouselWrapperDemo.propTypes = {
    className: PropTypes.string,
};

export default CarouselWrapperDemo;
