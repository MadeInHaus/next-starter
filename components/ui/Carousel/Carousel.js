import React, {
    useState,
    useRef,
    useCallback,
    useEffect,
    forwardRef,
    useImperativeHandle,
} from 'react';
import cx from 'classnames';

import { getCSSValues, hermite, sign, modulo, last, clamp } from './utils';

import styles from './Carousel.module.scss';

function easeInOutCubic(x) {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

const CarouselItem = ({ Wrapper, isDisabled, className, children }) => {
    const props = isDisabled
        ? { className }
        : {
              className: cx(styles.item, className),
              onDragStart: e => e.preventDefault(),
          };
    return <Wrapper {...props}>{children}</Wrapper>;
};

const Carousel = (props, ref) => {
    const {
        infinite = false,
        snap = false,
        align = 'start',
        damping = 200,
        snapbackThreshold = 100,
        maxSnapOvershootVelocity = 3,
        maxWheelVelocity = 3,
        activeItemIndex = 0,
        as: Container = 'ul',
        childAs: ChildWrapper = 'li',
        onActiveItemIndexChange,
        children,
        className,
        itemClassName,
        style,
    } = props;

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
    const itemOffsets = useRef();
    const visibleItems = useRef();
    const activeItemIndexInternal = useRef(activeItemIndex);
    const offset = useRef(0);

    const [isDisabled, setIsDisabled] = useState(false);

    const items = React.Children.map(children, child => {
        return (
            <CarouselItem
                Wrapper={ChildWrapper}
                isDisabled={isDisabled}
                className={itemClassName}
            >
                {child}
            </CarouselItem>
        );
    });

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

    const getItemWidth = useCallback(
        index => {
            if (itemWidth.current) {
                return itemWidth.current;
            }
            const i = modulo(index, items.length);
            if (!itemWidths.current.has(i)) {
                const node = container.current.childNodes[i];
                const { width } = node.getBoundingClientRect();
                itemWidths.current.set(i, width);
            }
            return itemWidths.current.get(i);
        },
        [items.length]
    );

    const getItemOffset = useCallback(
        i => {
            const iActive = activeItemIndexInternal.current;
            if (itemWidth.current) {
                return (iActive - i) * (itemWidth.current + gap.current);
            }
            if (!itemOffsets.current.has(i)) {
                if (i === iActive) {
                    // Offset of activeItem is by definition 0
                    itemOffsets.current.set(i, 0);
                } else if (!itemOffsets.current.has(i)) {
                    // Recurse towards activeItem
                    const dir = sign(iActive - i);
                    switch (align) {
                        case 'center':
                            const currHalf = getItemWidth(i) / 2;
                            const nextHalf = getItemWidth(i + dir) / 2;
                            const offset =
                                dir * (gap.current + currHalf + nextHalf) +
                                getItemOffset(i + dir);
                            itemOffsets.current.set(i, offset);
                            break;
                        default: {
                            const width = getItemWidth(i + Math.min(dir, 0));
                            const offset =
                                dir * (gap.current + width) +
                                getItemOffset(i + dir);
                            itemOffsets.current.set(i, offset);
                            break;
                        }
                    }
                }
            }
            return itemOffsets.current.get(i);
        },
        [align, getItemWidth]
    );

    const getEndOffset = useCallback(
        (i = items.length - 1) => {
            const xAdjust = align === 'center' ? 0 : getItemWidth(i);
            const snapPosDist =
                containerWidth.current -
                snapPosStart.current -
                snapPosEnd.current;
            return getItemOffset(i) + snapPosDist - xAdjust;
        },
        [align, items.length, getItemOffset, getItemWidth]
    );

    const findSnapDistance = useCallback(
        distance => {
            // distance: calculated total distance of throw
            // offset: position at start of throw (relative to the current
            // activeItem aligned to snapPosStart)
            // index: the current activeIndex
            // x: position at end of throw
            let index = activeItemIndexInternal.current;
            let x = offset.current + distance;
            let d = 0;
            const dir = sign(x);
            if (x !== 0) {
                // Find the best offset (nearest to x)
                let xDelta;
                let bestIndex = index;
                let bestOffset = 0;
                let bestDiff = Number.MAX_VALUE;
                let overshoot = 0;
                let overshootTarget = 0;

                do {
                    d = getItemOffset(index);
                    xDelta = x - d;
                    if (bestDiff > Math.abs(xDelta)) {
                        bestDiff = Math.abs(xDelta);
                        bestOffset = d;
                        bestIndex = index;
                    }
                    index -= dir;
                } while (xDelta * dir > 0);

                if (!infinite) {
                    const zeroOffset = getItemOffset(0);
                    if (zeroOffset < x) {
                        overshoot = -1;
                        overshootTarget = zeroOffset;
                    }
                    const endOffset = getEndOffset();
                    if (endOffset > x) {
                        overshoot = 1;
                        overshootTarget = endOffset;
                    }
                    xDelta = x - endOffset;
                    if (bestDiff > Math.abs(xDelta)) {
                        // We're close enough to snapPosEnd to land there
                        bestOffset = endOffset;
                        bestIndex = items.length - 1;
                    }
                }

                // send active index when not a thow
                const idx = Math.min(Math.max(bestIndex, 0), items.length - 1);
                if (onActiveItemIndexChange) {
                    onActiveItemIndexChange(idx);
                }

                return {
                    overshoot,
                    overshootTarget,
                    index: idx,
                    distance: bestOffset - offset.current,
                };
            }
            return {
                index,
                overshoot: 0,
                distance: -offset.current,
            };
        },
        [
            infinite,
            items.length,
            onActiveItemIndexChange,
            getItemOffset,
            getEndOffset,
        ]
    );

    const getItemPosition = useCallback(
        index => {
            let x1, x2;
            const itemWidth = getItemWidth(index);
            const itemOffset = getItemOffset(index);
            const x = offset.current + snapPosStart.current - itemOffset;
            switch (align) {
                case 'center':
                    x1 = x - itemWidth / 2;
                    x2 = x + itemWidth / 2;
                    break;
                default:
                    x1 = x;
                    x2 = x + itemWidth;
                    break;
            }
            return { x1, x2 };
        },
        [align, getItemWidth, getItemOffset]
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
                    if (node) {
                        node.style.transform = translate;
                    }
                }
            }
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
        if (!container.current) return;
        const visibleItemsPrev = new Set(visibleItems.current);
        visibleItems.current = new Set();
        const index = activeItemIndexInternal.current;
        const { x1, x2 } = getItemPosition(index);
        position(index, x1, x2);
        positionRight(modulo(index + 1, items.length), x2 + gap.current);
        positionLeft(modulo(index - 1, items.length), x1 - gap.current);
        visibleItemsPrev.forEach(index => {
            if (!visibleItems.current.has(index)) {
                const node = container.current.childNodes[index];
                if (node) {
                    node.style.transform = ``;
                }
            }
        });
    }, [items.length, position, positionLeft, positionRight, getItemPosition]);

    ///////////////////////////////////////////////////////////////////////////
    // ANIMATIONS
    ///////////////////////////////////////////////////////////////////////////

    const rafAutoScroll = useRef();
    const rafThrow = useRef();
    const rafSnapBack = useRef();
    const rafThrowOvershoot = useRef();

    const stopAutoScrollAnimation = useCallback(() => {
        cancelAnimationFrame(rafAutoScroll.current);
        rafAutoScroll.current = null;
    }, []);

    const stopThrowAnimation = useCallback(() => {
        cancelAnimationFrame(rafThrow.current);
        rafThrow.current = null;
    }, []);

    const stopSnapBackAnimation = useCallback(() => {
        cancelAnimationFrame(rafSnapBack.current);
        rafSnapBack.current = null;
    }, []);

    const stopThrowOvershootAnimation = useCallback(() => {
        cancelAnimationFrame(rafThrowOvershoot.current);
        rafThrowOvershoot.current = null;
    }, []);

    const stopAllAnimations = useCallback(() => {
        stopAutoScrollAnimation();
        stopThrowAnimation();
        stopSnapBackAnimation();
        stopThrowOvershootAnimation();
    }, [
        stopAutoScrollAnimation,
        stopThrowAnimation,
        stopSnapBackAnimation,
        stopThrowOvershootAnimation,
    ]);

    const shouldStartAutoScroll = useCallback(() => {
        return (
            infinite &&
            autoScroll.current !== 0 &&
            !disabled.current &&
            !rafAutoScroll.current
        );
    }, [infinite]);

    const animateAutoScroll = useCallback(
        (v0 = 0, tweenDuration = 500) => {
            if (!shouldStartAutoScroll()) {
                return;
            }
            const startTime = performance.now();
            const endTime = startTime + tweenDuration;
            let lastTime = startTime;
            const loop = () => {
                const currentTime = performance.now();
                const v = hermite(
                    currentTime,
                    v0,
                    autoScroll.current,
                    startTime,
                    endTime
                );
                offset.current += (currentTime - lastTime) * v;
                positionItems();
                lastTime = currentTime;
                rafAutoScroll.current = requestAnimationFrame(loop);
            };
            rafAutoScroll.current = requestAnimationFrame(loop);
        },
        [positionItems, shouldStartAutoScroll]
    );

    const animateThrowSnap = useCallback(
        v0 => {
            const k = damping;
            const duration = -k * Math.log(6 / (1000 * Math.abs(v0)));
            const distance = v0 * k * (1 - Math.exp(-duration / k));
            if (snap && autoScroll.current === 0) {
                const {
                    distance: distSnap,
                    overshoot,
                    overshootTarget,
                    index,
                } = findSnapDistance(distance);
                const vSnap = distSnap / (k * (1 - Math.exp(-duration / k)));
                const durSnap = -k * Math.log(6 / (1000 * Math.abs(vSnap)));
                return {
                    k,
                    velocity: vSnap,
                    duration: durSnap,
                    distance: distSnap,
                    overshoot,
                    overshootTarget,
                    index,
                };
            }
            return {
                k,
                velocity: v0,
                duration,
                distance,
                overshoot: 0,
            };
        },
        [snap, damping, findSnapDistance]
    );

    const animateSnapBack = useCallback(
        (targetOffset, tweenDuration = 300) => {
            const startTime = performance.now();
            const startOffset = offset.current;

            const loop = () => {
                const currentTime = performance.now();
                const elapsedTime = currentTime - startTime;
                const t = elapsedTime / tweenDuration;
                if (t < 1) {
                    const ease = easeInOutCubic(t);
                    const dist = targetOffset - startOffset;
                    offset.current = startOffset + dist * ease;
                    rafSnapBack.current = requestAnimationFrame(loop);
                } else {
                    offset.current = targetOffset;
                    rafSnapBack.current = null;
                }
                positionItems();
            };
            rafSnapBack.current = requestAnimationFrame(loop);
        },
        [positionItems]
    );

    const animateThrowOvershoot = useCallback(
        (v0, targetOffset, tweenDuration = 200) => {
            // max throw overshoot velocity
            // prevents ability to throw fast and overshoot an extreme amount
            const vel = clamp(
                v0,
                -maxSnapOvershootVelocity,
                maxSnapOvershootVelocity
            );
            const startTime = performance.now();
            const endTime = startTime + tweenDuration;
            let lastTime = startTime;
            const loop = () => {
                const currentTime = performance.now();
                const v = hermite(currentTime, vel, 0, startTime, endTime);
                offset.current += (currentTime - lastTime) * v;
                positionItems();
                if (Math.abs(v) < 0.001) {
                    animateSnapBack(targetOffset, 500);
                    rafSnapBack.current = null;
                } else {
                    lastTime = currentTime;
                    rafThrowOvershoot.current = requestAnimationFrame(loop);
                }
            };
            rafThrowOvershoot.current = requestAnimationFrame(loop);
        },
        [positionItems, animateSnapBack, maxSnapOvershootVelocity]
    );

    const animateThrow = useCallback(
        (v0, t0) => {
            const {
                k,
                velocity,
                duration,
                distance,
                overshoot,
                overshootTarget,
                index,
            } = animateThrowSnap(v0);
            const startPos = offset.current;
            const endPos = startPos + distance;
            if (sign(velocity) !== sign(autoScroll.current)) {
                // Reverse auto-scroll direction if it goes in the
                // opposite direction of the throw.
                autoScroll.current *= -1;
            }
            if (snap && autoScroll.current === 0 && onActiveItemIndexChange) {
                onActiveItemIndexChange(index);
            }
            const loop = () => {
                const currentTime = performance.now();
                const elapsedTime = currentTime - t0;
                const exp = Math.exp(-elapsedTime / k);
                const v = velocity * exp;
                if (shouldStartAutoScroll()) {
                    // If auto-scroll is enabled, and the velocity of the
                    // throw gets smaller than the auto-scroll velocity,
                    // auto-scroll takes over.
                    if (Math.abs(v) <= Math.abs(autoScroll.current)) {
                        animateAutoScroll(v, 1000);
                        return;
                    }
                }
                // Total distance traveled until now
                const d = velocity * k * (1 - exp);
                // Test for overshoot and snap back if this is a finite carousel
                if (!infinite) {
                    const pos = d + startPos;
                    if (overshoot == -1 && pos > overshootTarget) {
                        animateThrowOvershoot(v, overshootTarget);
                        return;
                    }
                    if (overshoot == 1 && pos < overshootTarget) {
                        animateThrowOvershoot(v, overshootTarget);
                        return;
                    }
                }
                // Exit condition: We're either
                // - sufficiently near the target (normal exit)
                // - or out of time (fail-safe)
                const isNearTarget = Math.abs(distance - d) < 0.1;
                const isOutOfTime = elapsedTime >= duration;
                if (isNearTarget || isOutOfTime) {
                    offset.current = endPos;
                    positionItems();
                    animateAutoScroll();
                } else {
                    rafThrow.current = requestAnimationFrame(loop);
                    offset.current = startPos + d;
                    positionItems();
                }
            };
            loop();
        },
        [
            animateThrowSnap,
            animateAutoScroll,
            animateThrowOvershoot,
            shouldStartAutoScroll,
            positionItems,
            infinite,
            snap,
            onActiveItemIndexChange,
        ]
    );

    ///////////////////////////////////////////////////////////////////////////
    // POINTER EVENTS, DRAGGING, THROWING
    ///////////////////////////////////////////////////////////////////////////

    const dragStart = useRef();
    const dragRegister = useRef();
    const dragScrollLock = useRef();
    const dragPreventClick = useRef();

    const addPointerEvents = () => {
        window.addEventListener('pointerup', handlePointerUp);
        window.addEventListener('pointercancel', handlePointerCancel);
        window.addEventListener('pointermove', handlePointerMove);
        if (container.current) {
            container.current.addEventListener('touchmove', handleTouchMove);
        }
    };

    const removePointerEvents = () => {
        window.removeEventListener('pointerup', handlePointerUp);
        window.removeEventListener('pointercancel', handlePointerCancel);
        window.removeEventListener('pointermove', handlePointerMove);
        if (container.current) {
            container.current.removeEventListener('touchmove', handleTouchMove);
        }
    };

    const handlePointerDown = event => {
        if (!event.isPrimary) return;
        if (event.pointerType === 'mouse' && event.button !== 0) return;
        stopAllAnimations();
        addPointerEvents();

        dragStart.current = { t: performance.now(), x: event.screenX };
        dragRegister.current = [];
        dragScrollLock.current = false;
        dragPreventClick.current = false;

        if (infinite) {
            const carouselWidth = getCarouselWidth();
            if (carouselWidth > 0) {
                offset.current = modulo(
                    offset.current,
                    carouselWidth + gap.current
                );
            }
        }
    };

    const handlePointerUp = event => {
        if (!event.isPrimary) return;
        dragEnd(event);
    };

    const handlePointerCancel = event => {
        if (!event.isPrimary) return;
        dragEnd(event);
    };

    const handlePointerMove = event => {
        if (!event.isPrimary) return;
        if (!dragScrollLock.current) {
            // Dragged horizontally for at least 5px: This is a legit swipe.
            // Prevent-default touchmoves to stop browser from taking over.
            const distTotal = Math.abs(event.screenX - dragStart.current.x);
            dragScrollLock.current = distTotal >= 5;
        }
        if (dragScrollLock.current) {
            // This needs to be set, otherwise we won't get pointer up/cancel
            // events when the mouse leaves the window on drag
            container.current.setPointerCapture(event.pointerId);
        }
        // Dragged at all: set flag to prevent clicks
        dragPreventClick.current = true;
        // Determine current position and velocity:
        const prev = last(dragRegister.current) || dragStart.current;
        const t = performance.now();
        const x = event.screenX;
        const dt = t - prev.t;
        const dx = x - prev.x;

        // early snapback drag cancel for finite snap carousels
        ///////////////////////////////////////////////////////////////////////
        if (!infinite) {
            // cancel drag early and snapback if dragged beyond snapback threshold
            if (getFiniteBounds().leftX > snapbackThreshold) {
                dragEnd(event);
            }
            if (getFiniteBounds().rightX < -snapbackThreshold) {
                dragEnd(event);
            }
        }

        if (dx !== 0) {
            dragRegister.current.push({ t, x, dt, dx });
            offset.current += dx;
            positionItems();
        }
    };

    const handleTouchMove = event => {
        if (dragScrollLock.current) {
            // Prevent-default touchmove events:
            // - Browser won't scroll and take over the pointer
            // - Pointer events continue to be dispatched to us
            if (event.cancelable) event.preventDefault();
        }
    };

    const handleClick = event => {
        if (dragPreventClick.current) {
            // Prevent-default click events:
            // After dragging, we don't want a dangling click to go through
            if (event.cancelable) event.preventDefault();
        }
    };

    const dragEnd = event => {
        // Clean up:
        dragScrollLock.current = false;
        container.current.releasePointerCapture(event.pointerId);
        removePointerEvents();
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
        if (Math.abs(v0) > 0.2 && damping > 0) {
            // Throw it!
            animateThrow(v0, t0);
        } else {
            // This was not a throw.
            if (shouldStartAutoScroll()) {
                // Auto scroll
                animateAutoScroll();
            } else {
                // Snap back
                let { distance, overshoot, overshootTarget } =
                    findSnapDistance(0);
                if (!infinite && overshoot) {
                    animateSnapBack(overshootTarget);
                } else if (snap) {
                    animateSnapBack(offset.current + distance);
                }
            }
        }
    };

    useEffect(() => {
        const el = container.current;
        el.addEventListener('click', handleClick);
        return () => {
            el.removeEventListener('click', handleClick);
            removePointerEvents();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    ///////////////////////////////////////////////////////////////////////////
    // MOUSE WHEEL
    ///////////////////////////////////////////////////////////////////////////

    const wheelDisabled = useRef(false);
    const wheelInertia = useRef(false);
    const wheelData = useRef([]);
    const wheelTimeout = useRef();
    const wheelDirection = useRef(0);

    const wheelOvershoot = useRef(false);
    const wheelOvershootTimeout = useRef(null);
    // arbitrary duration used to wait until inertia is over
    const wheelOvershootTimeoutDuration = 750;

    const isInertia = useCallback(dx => {
        const t = performance.now();
        let len = wheelData.current.length;
        if (len === 0) {
            wheelData.current = [{ t, dx }];
        } else {
            const dt = t - last(wheelData.current).t;
            wheelData.current.push({ t, dt, dx });
        }
        let result = false;
        if (len === 1) {
            wheelDirection.current = sign(dx);
        } else {
            const curDirection = sign(dx);
            if (wheelDirection.current !== curDirection) {
                // Change of swipe direction
                wheelData.current = [{ t, dx }];
                wheelDirection.current = curDirection;
            } else {
                const sampleSize = 8;
                if (len > sampleSize) {
                    let signCount = 0;
                    let equalCount = 0;
                    for (let i = len - sampleSize; i < len; i++) {
                        const dxPrev = wheelData.current[i - 1].dx;
                        const dxCur = wheelData.current[i].dx;
                        const ddx = dxCur - dxPrev;
                        if (ddx === 0) {
                            // Weed out mouse wheels which always emit the same
                            // high delta (usually >= 100)
                            if (Math.abs(dxPrev) > 10 && Math.abs(dxCur) > 10) {
                                equalCount++;
                            }
                        } else if (sign(ddx) === wheelDirection.current) {
                            // When actively swiping, the signs of the first dy and
                            // subsequent ddys tend to be the same (accelerate).
                            // When inertia kicks in, the signs differ (decelerate).
                            signCount++;
                        }
                    }
                    // Report inertia, when out of the latest [sampleSize] events
                    // - less than [sampleSize / 2] accelerated (most decelerated)
                    // - all showed some de-/acceleration for higher deltas
                    result =
                        signCount < Math.round(sampleSize / 2) &&
                        equalCount !== sampleSize;
                }
            }
        }
        return result;
    }, []);

    const onWheelTimeout = useCallback(() => {
        wheelInertia.current = false;
        wheelData.current = [];
    }, []);

    const getFiniteBounds = useCallback(() => {
        const index = activeItemIndexInternal.current;
        const { x1 } = getItemPosition(index);
        const values = getCSSValues(container.current);
        const { width } = container.current.getBoundingClientRect();
        const leftX = x1 - values.snap;
        const totalWidth =
            (values.width + values.gap) * items.length -
            (width - values.snap * 2);
        const rightX = leftX + totalWidth;
        return { leftX, totalWidth, rightX };
    }, [getItemPosition, items.length]);

    const engageWheelOvershootTimeout = useCallback(
        (v0 = 0, targetOffset = 0, index) => {
            // attemps to prevent user from seeing extreme overshoot from a high velocity throw
            // user can still move with wheel just not engage inertia during this timeout period
            // if there is enough inertia on the overshoot users will feel the pullback
            // of the still decaying inertia when the timer expires

            // increasing timeout means more time that the user cannot engage inertia (bad),
            // but less chance of decaying inertia animating the track in the wrong way (good)

            // as of this version, 750ms timeout is a good compromise.
            // things still get weird if the user pruposefully tries to yank at the edges over and over
            // basically, allow flying off the screen before coming back, or this

            // all because wheel inertia cannot be cancelled or restarted.

            wheelOvershoot.current = true;
            stopAutoScrollAnimation();
            animateThrowOvershoot(v0, targetOffset);
            onActiveItemIndexChange(index);
            clearTimeout(wheelOvershootTimeout.current);
            wheelOvershootTimeout.current = setTimeout(() => {
                wheelOvershoot.current = false;
            }, wheelOvershootTimeoutDuration);
        },
        [
            animateThrowOvershoot,
            stopAutoScrollAnimation,
            onActiveItemIndexChange,
        ]
    );

    const handleWheel = useCallback(
        event => {
            if (wheelDisabled.current || disabled.current) return;
            // https://github.com/facebook/react/blob/master/packages/react-dom/src/events/SyntheticEvent.js#L556-L559
            // > Browsers without "deltaMode" is reporting in raw wheel delta where
            // > one notch on the scroll is always +/- 120, roughly equivalent to
            // > pixels. A good approximation of DOM_DELTA_LINE (1) is 5% of
            // > viewport size or ~40 pixels, for DOM_DELTA_SCREEN (2) it is 87.5%
            // > of viewport size.
            let multiplicator = 1;
            if (event.deltaMode === 1) {
                multiplicator = window.innerHeight * 0.05;
            } else if (event.deltaMode === 2) {
                multiplicator = window.innerHeight * 0.875;
            }
            const dx = event.deltaX * multiplicator;
            const dy = event.deltaY * multiplicator;
            const a = (Math.atan2(dy, dx) * 180) / Math.PI;
            const vertical = (a > -135 && a < -45) || (a > 45 && a < 135);
            if (!vertical) {
                event.preventDefault();
                stopAutoScrollAnimation();

                // early snapback wheel cancel
                // warning: inertia cannot be cancelled so we are using an arbitrary timeout
                ///////////////////////////////////////////////////////////////////////
                if (!infinite) {
                    // engage wheel timeout and snapback if wheeled beyond snapback threshold
                    if (getFiniteBounds().leftX > snapbackThreshold) {
                        if (!wheelOvershoot.current) {
                            const latestData = last(wheelData.current);
                            const v0 = -(latestData?.dx / latestData?.dt);
                            const { index } = animateThrowSnap(v0);
                            engageWheelOvershootTimeout(0, 0, index);
                        }
                        return;
                    }
                    if (getFiniteBounds().rightX < -snapbackThreshold) {
                        if (!wheelOvershoot.current) {
                            const latestData = last(wheelData.current);
                            const v0 = -(latestData?.dx / latestData?.dt);
                            const { index } = animateThrowSnap(v0);
                            engageWheelOvershootTimeout(
                                0,
                                -getFiniteBounds().totalWidth,
                                index
                            );
                        }
                        return;
                    }
                }

                if (!isInertia(dx)) {
                    // Swipe
                    offset.current -= dx;
                    positionItems();
                    stopThrowAnimation();
                    wheelInertia.current = false;
                } else if (!wheelInertia.current && !wheelOvershoot.current) {
                    // Inertia
                    const latestData = last(wheelData.current);
                    if (latestData.dt) {
                        const v0 = -(latestData.dx / latestData.dt);
                        // caps inertia animation speed
                        const vel = clamp(
                            v0,
                            -maxWheelVelocity,
                            maxWheelVelocity
                        );
                        animateThrow(vel, performance.now());
                        wheelInertia.current = true;
                    }
                }
            }
            clearTimeout(wheelTimeout.current);
            wheelTimeout.current = setTimeout(onWheelTimeout, 100);
        },
        [
            onWheelTimeout,
            stopAutoScrollAnimation,
            infinite,
            snap,
            isInertia,
            getFiniteBounds,
            snapbackThreshold,
            animateThrowSnap,
            engageWheelOvershootTimeout,
            positionItems,
            stopThrowAnimation,
            maxWheelVelocity,
            animateThrow,
        ]
    );

    useEffect(() => {
        const el = container.current;
        el.addEventListener('wheel', handleWheel);
        return () => {
            el.removeEventListener('wheel', handleWheel);
            clearTimeout(wheelTimeout.current);
        };
    }, [handleWheel]);

    ///////////////////////////////////////////////////////////////////////////
    // INIT/RESIZE/API
    ///////////////////////////////////////////////////////////////////////////

    const moveIntoView = useCallback(
        index => {
            // TODO: infinite carousels
            // TODO: adapt velocity to distance
            const itemOffset = getItemOffset(index);
            const endOffset = getEndOffset(items.length - 1);
            // console.log({ offset: offset.current, itemOffset, endOffset });
            // console.log(offset.current + 50 - itemOffset, getCarouselWidth());
            // console.log(getItemPosition(index))
            stopAllAnimations();
            animateSnapBack(Math.max(itemOffset, endOffset));
        },
        [
            items.length,
            getItemOffset,
            getEndOffset,
            stopAllAnimations,
            animateSnapBack,
        ]
    );

    const handleResize = useCallback(() => {
        // Get pixel values from CSS custom properties:
        // --carousel-gap
        // --carousel-snap-position
        // --carousel-snap-position-start
        // --carousel-snap-position-end
        // --carousel-item-width
        // --carousel-autoscroll
        // --carousel-disabled
        if (!container.current) return;
        const values = getCSSValues(container.current);
        gap.current = Math.max(values.gap || 0, 0);
        itemWidth.current = Math.max(values.width || 0, 0);
        snapPos.current = values.snap || 0;
        snapPosStart.current = values.snapStart || snapPos.current;
        snapPosEnd.current = values.snapEnd || snapPos.current;
        disabled.current = !!values.disabled;
        if (Math.abs(autoScroll.current) !== Math.abs(values.autoScroll)) {
            autoScroll.current = values.autoScroll;
        }
        // Disable the carousel if needed
        container.current.classList.toggle('disabled', disabled.current);
        if (disabled.current !== isDisabled) {
            setIsDisabled(disabled.current);
        }
        if (disabled.current) {
            stopAllAnimations();
            items.forEach((_, index) => {
                const node = container.current?.childNodes[index];
                if (node) {
                    node.style.transform = '';
                }
            });
            return;
        }
        // Initialize some other refs:
        const { width } = container.current.getBoundingClientRect();
        containerWidth.current = width;
        carouselWidth.current = 0;
        itemWidths.current = new Map();
        itemOffsets.current = new Map();
        if (activeItemIndexInternal.current !== activeItemIndex) {
            activeItemIndexInternal.current = activeItemIndex;
        }
        try {
            positionItems();
        } catch (e) {
            console.error('boom');
            throw e;
        }
        // Start or stop auto-scroll animation
        if (autoScroll.current) {
            animateAutoScroll();
        } else {
            stopAutoScrollAnimation();
        }
    }, [
        items,
        isDisabled,
        positionItems,
        activeItemIndex,
        animateAutoScroll,
        stopAllAnimations,
        stopAutoScrollAnimation,
    ]);

    useEffect(() => {
        handleResize();
        const el = container.current;
        const resizeObserver = new ResizeObserver(() => handleResize());
        resizeObserver.observe(el);
        return () => resizeObserver.unobserve(el);
    }, [handleResize]);

    useImperativeHandle(
        ref,
        () => ({
            refresh: () => {
                handleResize();
            },
            moveIntoView: (...args) => {
                moveIntoView(...args);
            },
        }),
        [handleResize, moveIntoView]
    );

    return (
        <Container
            ref={container}
            onPointerDown={isDisabled ? null : handlePointerDown}
            className={cx(styles.root, className)}
            style={style}
        >
            {items}
        </Container>
    );
};

export default React.memo(forwardRef(Carousel));
