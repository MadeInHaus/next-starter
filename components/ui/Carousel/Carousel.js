import React, { useState, useRef, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import { modulo, mappable } from 'utils';
import { getCSSValues, isUndef } from './utils';

import styles from './Carousel.module.scss';

const CarouselItem = item => <div className={styles.item}>{item}</div>;

const Carousel = ({
    infinite,
    snap,
    align,
    activeItemIndex,
    children,
    className,
}) => {
    const [items, setItems] = useState(
        React.Children.map(children, CarouselItem)
    );

    const container = useRef();
    const containerWidth = useRef();
    const carouselWidth = useRef();
    const gap = useRef();
    const snapPos = useRef();
    const snapPosStart = useRef();
    const snapPosEnd = useRef();
    const itemWidth = useRef();
    const itemWidths = useRef();
    const visibleItems = useRef();
    const offset = useRef(0);

    const getItemWidth = useCallback(index => {
        if (itemWidth.current) {
            return itemWidth.current;
        }
        if (!itemWidths.current.has(index)) {
            const node = container.current.childNodes[index];
            const { width } = node.getBoundingClientRect();
            itemWidths.current.set(index, width);
            console.log(`getItemWidth ${index} ${width}`);
        }
        return itemWidths.current.get(index);
    }, []);

    const getCarouselWidth = useCallback(() => {
        if (itemWidth.current) {
            return (
                itemWidth.current * items.length +
                gap.current * (items.length - 1)
            );
        }
        if (itemWidths.current.size === items.length) {
            const widths = Array.from(itemWidths.current.values());
            return (
                widths.reduce((acc, width) => acc + width) +
                gap.current * (items.length - 1)
            );
        }
        return 0;
    }, [items]);

    const getActiveItemPosition = useCallback(
        index => {
            let x1, x2;
            const x = snapPos.current + offset.current;
            const width = getItemWidth(index);
            switch (align) {
                case 'start':
                    x1 = x;
                    x2 = x + width;
                    break;
                case 'center':
                    x1 = x - width / 2;
                    x2 = x + width / 2;
                    break;
                case 'end':
                    x1 = x - width;
                    x2 = x;
                    break;
            }
            return { x1, x2 };
        },
        [align, getItemWidth]
    );

    const position = useCallback(
        (index, x1, x2) => {
            const isVisible = x1 < containerWidth.current && x2 > 0;
            if (isVisible) {
                if (visibleItems.current.has(index)) {
                    if (infinite) {
                        throw new Error();
                    } else {
                        console.info('This should not happen.');
                    }
                } else {
                    visibleItems.current.add(index);
                    const node = container.current.childNodes[index];
                    const translate = `translate3d(${x1}px, 0, 0)`;
                    node.style.transform = translate;
                }
            }
            // const visibility = isVisible ? 'visible' : 'hidden';
            // console.log(`${index} ${x1} ${x2} ${visibility}`);
        },
        [infinite]
    );

    const positionRight = useCallback(
        (index, x1) => {
            if (!infinite && index === 0) return;
            const width = getItemWidth(index);
            const x2 = x1 + width;
            position(index, x1, x2);
            if (x2 + gap.current < containerWidth.current) {
                positionRight(
                    modulo(index + 1, items.length),
                    x2 + gap.current
                );
            }
        },
        [items, infinite, position, getItemWidth]
    );

    const positionLeft = useCallback(
        (index, x2) => {
            if (!infinite && index === items.length - 1) return;
            const width = getItemWidth(index);
            const x1 = x2 - width;
            position(index, x1, x2);
            if (x1 - gap.current > 0) {
                positionLeft(modulo(index - 1, items.length), x1 - gap.current);
            }
        },
        [items, infinite, position, getItemWidth]
    );

    const positionItems = useCallback(() => {
        const index = activeItemIndex;
        const numItems = items.length;
        const { x1, x2 } = getActiveItemPosition(index);
        const visibleItemsPrev = new Set(visibleItems.current);
        visibleItems.current = new Set();
        position(index, x1, x2);
        if (x2 + gap.current < containerWidth.current) {
            positionRight(modulo(index + 1, numItems), x2 + gap.current);
        }
        if (x1 - gap.current > 0) {
            positionLeft(modulo(index - 1, numItems), x1 - gap.current);
        }
        visibleItemsPrev.forEach(index => {
            if (!visibleItems.current.has(index)) {
                container.current.childNodes[index].style.transform = '';
            }
        });
    }, [
        items,
        position,
        positionLeft,
        positionRight,
        getActiveItemPosition,
        activeItemIndex,
    ]);

    useEffect(() => {
        const handleResize = () => {
            // Get pixel values from CSS custom properties:
            // --carousel-gap
            // --carousel-snap-position
            // --carousel-snap-position-start
            // --carousel-snap-position-end
            // --carousel-item-width
            const values = getCSSValues(container.current);
            gap.current = isUndef(values.gap) ? 0 : values.gap;
            itemWidth.current = isUndef(values.width) ? 0 : values.width;
            snapPos.current = isUndef(values.snap) ? 0 : values.snap;
            snapPosStart.current = isUndef(values.snapStart)
                ? snapPos.current
                : values.snapStart;
            snapPosEnd.current = isUndef(values.snapEnd)
                ? snapPos.current
                : values.snapEnd;
            // Initialize some other refs:
            const { width } = container.current.getBoundingClientRect();
            containerWidth.current = width;
            carouselWidth.current = 0;
            itemWidths.current = new Map();
            try {
                // Initial positioning
                positionItems();
            } catch (e) {
                // This is an infinite carousel and it doesn't have
                // enough items to fill the entire container:
                // Duplicate children until we have enough items.
                const count = items.length / React.Children.count(children);
                const dupes = mappable(count + 1).map(() => children);
                setItems(React.Children.map(dupes, CarouselItem));
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
        // Note: `children` is another dependency but `items` should suffice
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items, positionItems]);

    return (
        <div ref={container} className={cx(styles.root, className)}>
            {items}
        </div>
    );
};

Carousel.propTypes = {
    infinite: PropTypes.bool,
    snap: PropTypes.bool,
    align: PropTypes.oneOf(['start', 'center', 'end']),
    activeItemIndex: PropTypes.number,
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
};

Carousel.defaultProps = {
    infinite: false,
    snap: false,
    align: 'start',
    activeItemIndex: 0,
};

export default Carousel;
