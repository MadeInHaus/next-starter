import React, { useState, useRef, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import { modulo, mappable, last } from 'utils';
import { getCSSValues, hermite, sign } from './utils';

import styles from './Carousel.module.scss';

const CarouselItem = item => <div className={styles.item}>{item}</div>;

const Carousel = ({
    infinite,
    snap,
    align,
    dampingFactor,
    activeItemIndex,
    children,
    className,
}) => {
    const container = useRef();
    const containerWidth = useRef();
    const carouselWidth = useRef();
    const gap = useRef();
    const disabled = useRef();
    const autoScroll = useRef();
    const snapPos = useRef();
    const snapPosStart = useRef();
    const snapPosEnd = useRef();
    const itemWidth = useRef();
    const itemWidths = useRef();
    const visibleItems = useRef();
    const activeItemIndexInternal = useRef(activeItemIndex);
    const offset = useRef(0);

    const k = Math.pow(dampingFactor, 5);

    const [isDisabled, setIsDisabled] = useState(false);

    const [items, setItems] = useState(
        React.Children.map(children, CarouselItem)
    );

    ///////////////////////////////////////////////////////////////////////////
    // POSITIONING
    ///////////////////////////////////////////////////////////////////////////

    const getCarouselWidth = useCallback(() => {
        if (carouselWidth.current === 0) {
            if (itemWidth.current) {
                carouselWidth.current =
                    itemWidth.current * items.length +
                    gap.current * (items.length - 1);
            }
            if (itemWidths.current.size === items.length) {
                const widths = Array.from(itemWidths.current.values());
                carouselWidth.current =
                    widths.reduce((acc, width) => acc + width) +
                    gap.current * (items.length - 1);
            }
        }
        return carouselWidth.current;
    }, [items.length]);

    const getItemWidth = useCallback(index => {
        if (itemWidth.current) {
            return itemWidth.current;
        }
        if (!itemWidths.current.has(index)) {
            const node = container.current.childNodes[index];
            const { width } = node.getBoundingClientRect();
            itemWidths.current.set(index, width);
        }
        return itemWidths.current.get(index);
    }, []);

    const getItemPosition = useCallback(
        index => {
            let x1, x2;
            const x = snapPosStart.current + offset.current;
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
            while (x1 < containerWidth.current && (infinite || index !== 0)) {
                const width = getItemWidth(index);
                const x2 = x1 + width;
                position(index, x1, x2);
                index = modulo(index + 1, items.length);
                x1 = x2 + gap.current;
            }
        },
        [items.length, infinite, position, getItemWidth]
    );

    const positionLeft = useCallback(
        (index, x2) => {
            while (x2 > 0 && (infinite || index !== items.length - 1)) {
                const width = getItemWidth(index);
                const x1 = x2 - width;
                position(index, x1, x2);
                index = modulo(index - 1, items.length);
                x2 = x1 - gap.current;
            }
        },
        [items.length, infinite, position, getItemWidth]
    );

    const positionItems = useCallback(() => {
        if (infinite) {
            const carouselWidth = getCarouselWidth();
            if (carouselWidth > 0) {
                offset.current = modulo(
                    offset.current,
                    carouselWidth + gap.current
                );
            }
        }
        const visibleItemsPrev = new Set(visibleItems.current);
        visibleItems.current = new Set();
        const index = activeItemIndexInternal.current;
        const { x1, x2 } = getItemPosition(index);
        position(index, x1, x2);
        positionRight(modulo(index + 1, items.length), x2 + gap.current);
        positionLeft(modulo(index - 1, items.length), x1 - gap.current);
        visibleItemsPrev.forEach(index => {
            if (!visibleItems.current.has(index)) {
                container.current.childNodes[index].style.transform = '';
            }
        });
    }, [
        items.length,
        infinite,
        position,
        positionLeft,
        positionRight,
        getItemPosition,
        getCarouselWidth,
    ]);

    ///////////////////////////////////////////////////////////////////////////
    // POINTER EVENTS, DRAGGING, THROWING
    ///////////////////////////////////////////////////////////////////////////

    const dragStart = useRef();
    const dragScrollLock = useRef();
    const dragRegister = useRef();

    const addPointerEvents = () => {
        window.addEventListener('pointerup', handlePointerUp);
        window.addEventListener('pointercancel', handlePointerCancel);
        window.addEventListener('pointermove', handlePointerMove);
        container.current.addEventListener('touchmove', handleTouchMove);
    };

    const removePointerEvents = () => {
        window.removeEventListener('pointerup', handlePointerUp);
        window.removeEventListener('pointercancel', handlePointerCancel);
        window.removeEventListener('pointermove', handlePointerMove);
        container.current.removeEventListener('touchmove', handleTouchMove);
    };

    const handlePointerDown = event => {
        if (!event.isPrimary) return;
        addPointerEvents();
        container.current.setPointerCapture(event.pointerId);
        dragStart.current = { t: performance.now(), x: event.screenX };
        dragRegister.current = [];
        dragScrollLock.current = false;
        cancelAnimationFrame(rafThrow.current);
        cancelAnimationFrame(rafAutoScroll.current);
    };

    const handlePointerUp = event => {
        if (!event.isPrimary) return;
        removePointerEvents();
        dragEnd();
    };

    const handlePointerCancel = event => {
        if (!event.isPrimary) return;
        removePointerEvents();
        dragEnd();
    };

    const handlePointerMove = event => {
        if (!event.isPrimary) return;
        if (!dragScrollLock.current) {
            // Dragged horizontally for at least 10px: This is a legit swipe.
            // Prevent-default touchmoves to stop browser from taking over.
            const distTotal = Math.abs(event.screenX - dragStart.current.x);
            dragScrollLock.current = distTotal >= 10;
        }
        // Determine current position and velocity:
        const prev = last(dragRegister.current) || dragStart.current;
        const t = performance.now();
        const x = event.screenX;
        const dt = t - prev.t;
        const dx = x - prev.x;
        if (dx !== 0) {
            dragRegister.current.push({ t, x, dt, dx });
            offset.current += dx;
            positionItems();
        }
    };

    const handleTouchMove = event => {
        if (dragScrollLock.current) {
            // Prevent-defaulting touchmove events:
            // - Browser won't scroll and take over the pointer
            // - Pointer events continue to be dispatched to us
            event.preventDefault();
        }
    };

    const dragEnd = () => {
        dragScrollLock.current = false;
        // Determine velocity v0:
        // Disregard first sample
        dragRegister.current.shift();
        // Require at least 3 samples
        if (dragRegister.current.length >= 3) {
            // Latest sample must be less than 50ms old
            const currentTime = performance.now();
            const lastTime = last(dragRegister.current).t;
            if (currentTime - lastTime < 50) {
                // Average the last max 5 sample velocities.
                // Latest samples are applied a smaller weight than older ones
                // because velocity in the last one or two frames tends to
                // decrease significantly
                const relevantSamples = dragRegister.current
                    .slice(-5)
                    .reverse();
                let v0 = 0;
                let weightSum = 0;
                relevantSamples.forEach((sample, i) => {
                    v0 += ((i + 1) * sample.dx) / sample.dt;
                    weightSum += i + 1;
                });
                v0 /= weightSum;
                dragThrow(v0, lastTime);
                return;
            }
        }
        dragThrow(0, 0);
    };

    const dragThrow = (v0, t0) => {
        if (Math.abs(v0) > 0.2) {
            animateThrow(v0, t0);
        } else {
            animateAutoScroll();
            console.log(`v0 = ${v0}`);
        }
        // 800
        // 400
        // 0
        // -400
        // -800

        // 380 + 20
    };

    ///////////////////////////////////////////////////////////////////////////
    // ANIMATIONS
    ///////////////////////////////////////////////////////////////////////////

    const rafAutoScroll = useRef();
    const rafThrow = useRef();

    const animateAutoScroll = useCallback(
        (v0 = 0, tweenDuration = 500) => {
            cancelAnimationFrame(rafAutoScroll.current);
            if (!infinite || disabled.current || autoScroll.current === 0) {
                return;
            }
            const startTime = performance.now();
            let lastTime = startTime;
            const loop = () => {
                const currentTime = performance.now();
                const v = hermite(
                    currentTime,
                    v0,
                    autoScroll.current,
                    startTime,
                    startTime + tweenDuration
                );
                offset.current += (currentTime - lastTime) * v;
                positionItems();
                lastTime = currentTime;
                rafAutoScroll.current = requestAnimationFrame(loop);
            };
            rafAutoScroll.current = requestAnimationFrame(loop);
        },
        [infinite, positionItems]
    );

    const animateThrowComplete = useCallback(() => {
        animateAutoScroll();
    }, [animateAutoScroll]);

    const animateThrow = useCallback(
        (v0, t0) => {
            const targetDist = v0 / k - (v0 * Math.exp(-k * 1000)) / k;
            const startPos = offset.current;
            const endPos = startPos + targetDist;
            if (infinite && sign(v0) !== sign(autoScroll.current)) {
                autoScroll.current *= -1;
            }
            const loop = () => {
                const currentTime = performance.now();
                const elapsedTime = currentTime - t0;
                const exp = Math.exp(-k * elapsedTime);
                const dist = (v0 * (1 - exp)) / k;
                const v = v0 * exp;
                if (infinite && autoScroll.current) {
                    if (Math.abs(v) <= Math.abs(autoScroll.current)) {
                        animateAutoScroll(v, 1000);
                        return;
                    }
                }
                if (Math.abs(targetDist - dist) > 0.1 && elapsedTime < 1000) {
                    rafThrow.current = requestAnimationFrame(loop);
                    offset.current = startPos + dist;
                    positionItems();
                } else {
                    offset.current = endPos;
                    positionItems();
                    animateThrowComplete();
                    console.log(
                        'done',
                        targetDist - dist,
                        elapsedTime,
                        offset.current
                    );
                }
            };
            loop();
        },
        [k, infinite, positionItems, animateAutoScroll, animateThrowComplete]
    );

    ///////////////////////////////////////////////////////////////////////////
    // EFFECTS
    ///////////////////////////////////////////////////////////////////////////

    useEffect(() => {
        const handleResize = () => {
            // Get pixel values from CSS custom properties:
            // --carousel-gap
            // --carousel-snap-position
            // --carousel-snap-position-start
            // --carousel-snap-position-end
            // --carousel-item-width
            // --carousel-autoscroll
            // --carousel-disabled
            const values = getCSSValues(container.current);
            gap.current = Math.max(values.gap || 0, 0);
            itemWidth.current = Math.max(values.width || 0, 0);
            snapPos.current = values.snap || 0;
            snapPosStart.current = values.snapStart || snapPos.current;
            snapPosEnd.current = values.snapEnd || snapPos.current;
            autoScroll.current = values.autoScroll;
            disabled.current = !!values.disabled;
            // Stop all animations
            cancelAnimationFrame(rafThrow.current);
            cancelAnimationFrame(rafAutoScroll.current);
            // Disable the carousel if needed
            container.current.classList.toggle('disabled', disabled.current);
            if (disabled.current !== isDisabled) {
                setIsDisabled(disabled.current);
            }
            if (disabled.current) {
                visibleItems.current?.forEach(index => {
                    container.current.childNodes[index].style.transform = '';
                });
                return;
            }
            // Initialize some other refs:
            const { width } = container.current.getBoundingClientRect();
            containerWidth.current = width;
            carouselWidth.current = 0;
            itemWidths.current = new Map();
            try {
                // Initial positioning
                positionItems();
            } catch (e) {
                console.error('boom');
                throw e;
                // TODO: DON'T DO THIS
                // This is an infinite carousel and it doesn't have
                // enough items to fill the entire container:
                // Duplicate children until we have enough items.
                const count = items.length / React.Children.count(children);
                const dupes = mappable(count + 1).map(() => children);
                setItems(React.Children.map(dupes, CarouselItem));
            }
            // Start auto scroll if needed
            animateAutoScroll();
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
        // Note: `children` is another dependency but `items.length` should suffice
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items.length, isDisabled, positionItems]);

    return (
        <div
            ref={container}
            onPointerDown={isDisabled ? null : handlePointerDown}
            className={cx(styles.root, className)}
        >
            {items}
        </div>
    );
};

Carousel.propTypes = {
    infinite: PropTypes.bool,
    snap: PropTypes.bool,
    align: PropTypes.oneOf(['start', 'center', 'end']),
    dampingFactor: PropTypes.number,
    activeItemIndex: PropTypes.number,
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
};

Carousel.defaultProps = {
    infinite: false,
    snap: false,
    align: 'start',
    dampingFactor: 0.4,
    activeItemIndex: 0,
};

export default Carousel;
