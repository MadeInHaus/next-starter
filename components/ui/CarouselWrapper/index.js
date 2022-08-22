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
import { useIntersection } from 'react-use';
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
        visibleItems,
        showOverflowFade,
        navComponent,
        getActiveIndex,
        style,
    },
    ref
) => {
    const rootRef = useRef(null);
    const carouselRef = useRef(null);
    const [index, setIndex] = useState(0);
    const [inView, setInView] = useState(0);

    const intersection = useIntersection(rootRef, {
        rootMargin: '0px',
        threshold: 0.15,
    });

    useEffect(() => {
        const intersecting = intersection && intersection.isIntersecting;
        setInView(intersecting);
    }, [intersection, rootRef]);

    const handleIndex = index => {
        const visibleIndex =
            index > children.length - visibleItems
                ? children.length - visibleItems
                : index;

        setIndex(visibleIndex);
        getActiveIndex && getActiveIndex(visibleIndex);
    };

    const handleArrowIndex = index => {
        setIndex(index);
        carouselRef.current.moveIntoView(index);
    };

    const handleKeyUp = useCallback(
        e => {
            const arrowLeft = e.keyCode === 37;
            const arrowRight = e.keyCode === 39;
            if (inView) {
                if (
                    arrowRight &&
                    index + visibleItems - 1 < children.length - 1
                ) {
                    setIndex(index + 1);
                    carouselRef.current.moveIntoView(index + 1);
                } else if (arrowLeft && index > 0) {
                    setIndex(index - 1);
                    carouselRef.current.moveIntoView(index - 1);
                }
            }
        },
        [inView, children.length, index, visibleItems]
    );

    useEffect(() => {
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [handleKeyUp]);

    const handleRefresh = useCallback(() => {
        carouselRef.current.refresh();
    }, []);

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
                    setIndex: handleArrowIndex,
                    visibleItems,
                })}
        </>
    );
};

CarouselWrapper.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    itemWidth: PropTypes.number,
    items: PropTypes.array,
    showOverflowFade: PropTypes.bool,
    navComponent: PropTypes.func,
    visibleItems: PropTypes.number,
};

CarouselWrapper.defaultProps = {
    showOverflowFade: false,
    visibleItems: 1,
};

export default React.memo(forwardRef(CarouselWrapper));
