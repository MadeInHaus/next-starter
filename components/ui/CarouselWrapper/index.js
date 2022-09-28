import React, {
    forwardRef,
    useCallback,
    useEffect,
    useState,
    useRef,
    useImperativeHandle,
} from 'react';
import PropTypes from 'prop-types';
import useEffectAfterFirstRender from './useEffectAfterFirstRender';
import { useIntersection, useWindowSize } from 'react-use';
import Carousel from 'components/ui/Carousel';
import styles from './CarouselWrapper.module.scss';

const CarouselWrapper = (
    {
        snap,
        align,
        infinite,
        activeItemIndex,
        children,
        className,
        snapbackThreshold,
        maxSnapOvershootVelocity,
        autoTimerSeconds,
        navComponent,
        getActiveIndex,
        style,
    },
    ref
) => {
    const rootRef = useRef(null);
    const carouselRef = useRef(null);
    const timerRef = useRef(null);
    const visibleItems = useRef();
    const [index, setIndex] = useState(0);
    const [inView, setInView] = useState(0);
    const [timerPaused, setTimerPaused] = useState(false);

    const { width } = useWindowSize();

    const intersection = useIntersection(rootRef, {
        rootMargin: '0px',
        threshold: 0.15,
    });

    useEffect(() => {
        const intersecting = intersection && intersection.isIntersecting;
        setInView(intersecting);
    }, [intersection, rootRef]);

    const handleIndex = index => {
        if (infinite) {
            setIndex(index);
            getActiveIndex && getActiveIndex(index);
        } else {
            const visibleIndex =
                index > children.length - visibleItems.current
                    ? children.length - visibleItems.current
                    : index;

            setIndex(visibleIndex);
            getActiveIndex && getActiveIndex(visibleIndex);
        }
    };

    const setAndMove = index => {
        setIndex(index);
        carouselRef.current.moveIntoView(index);
    };

    const timerNext = useCallback(() => {
        const finiteIndex =
            (index + 1) % (children.length - visibleItems.current + 1);
        timerRef.current = setTimeout(() => {
            setAndMove(infinite ? index + 1 : finiteIndex);
        }, autoTimerSeconds * 1000);
    }, [autoTimerSeconds, children.length, index, infinite]);

    const handleNavIndex = index => {
        setTimerPaused(true);
        if (infinite) {
            setAndMove(index);
        } else {
            const visibleIndex =
                index > children.length - visibleItems.current
                    ? children.length - visibleItems.current
                    : index;
            setAndMove(visibleIndex);
        }
    };

    const handlePointerInteraction = () => {
        if (autoTimerSeconds) {
            clearTimeout(timerRef.current);
            setTimerPaused(true);
        }
    };

    const handleKeyUp = useCallback(
        e => {
            const arrowLeft = e.keyCode === 37;
            const arrowRight = e.keyCode === 39;
            setTimerPaused(true);

            if (inView) {
                if (infinite) {
                    if (arrowLeft) {
                        setAndMove(index - 1);
                    } else if (arrowRight) {
                        setAndMove(index + 1);
                    }
                } else {
                    if (
                        arrowRight &&
                        index + visibleItems.current - 1 < children.length - 1
                    ) {
                        setAndMove(index + 1);
                    } else if (arrowLeft && index > 0) {
                        setAndMove(index - 1);
                    }
                }
            }
        },
        [inView, infinite, index, children.length]
    );

    useEffect(() => {
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [handleKeyUp]);

    const handleRefresh = useCallback(() => {
        carouselRef.current.refresh();

        if (autoTimerSeconds) {
            if (inView && !timerPaused) {
                timerNext();
            } else {
                clearTimeout(timerRef.current);
            }
        }
    }, [autoTimerSeconds, inView, timerNext, timerPaused]);

    useEffectAfterFirstRender(() => {
        handleRefresh();
    }, []);

    useImperativeHandle(
        ref,
        () => ({
            refresh: () => {
                handleRefresh();
            },
        }),
        [handleRefresh]
    );

    useEffect(() => {
        if (autoTimerSeconds) {
            if (inView && !timerPaused) {
                timerNext();
            } else {
                clearTimeout(timerRef.current);
            }
        }
    }, [inView, autoTimerSeconds, index, timerNext, timerPaused]);

    const handleResize = useCallback(() => {
        // get carousel-wrapper css vars
        const computed = getComputedStyle(rootRef.current);
        visibleItems.current = parseFloat(
            computed.getPropertyValue('--carousel-wrapper-visible-items')
        );

        if (autoTimerSeconds) {
            if (inView && !timerPaused) {
                clearTimeout(timerRef.current);
                timerNext();
            } else {
                clearTimeout(timerRef.current);
            }
        }
    }, [autoTimerSeconds, inView, timerNext, timerPaused]);

    useEffect(() => {
        handleResize();
        const el = rootRef.current;
        const resizeObserver = new ResizeObserver(() => handleResize());
        resizeObserver.observe(el);
        return () => resizeObserver.unobserve(el);
    }, [handleResize]);

    useEffect(() => {
        // reset position on width change
        carouselRef.current.moveIntoView(index);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [width]);

    useEffect(() => {
        // bring back auto timer after pause if user comes back to intersection
        if (autoTimerSeconds && timerPaused) {
            if (inView) {
                setTimerPaused(false);
                timerNext();
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inView]);

    return (
        <>
            <div ref={rootRef} className={styles.root}>
                <Carousel
                    ref={carouselRef}
                    snap={snap}
                    align={align}
                    infinite={infinite}
                    activeItemIndex={activeItemIndex}
                    onActiveItemIndexChange={handleIndex}
                    onPointerInteraction={handlePointerInteraction}
                    snapbackThreshold={snapbackThreshold}
                    maxSnapOvershootVelocity={maxSnapOvershootVelocity}
                    className={className}
                    style={style}
                >
                    {children}
                </Carousel>
            </div>
            {navComponent &&
                navComponent({
                    index: index,
                    itemsLength: children.length,
                    setIndex: handleNavIndex,
                    visibleItems: visibleItems.current,
                    infinite,
                })}
        </>
    );
};

CarouselWrapper.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    itemWidth: PropTypes.number,
    items: PropTypes.array,
    navComponent: PropTypes.func,
    visibleItems: PropTypes.number,
    autoTimerSeconds: PropTypes.number,
};

CarouselWrapper.defaultProps = {
    visibleItems: 1,
    autoTimerSeconds: 0,
};

export default React.memo(forwardRef(CarouselWrapper));
