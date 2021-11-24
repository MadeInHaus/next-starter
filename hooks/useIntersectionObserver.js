import { useState, useCallback, useRef } from 'react';

export default function useIntersectionObserver({
    once = true,
    root = null,
    rootMargin = '0px 0px 0px 0px',
    threshold = 0,
} = {}) {
    const [inView, setInView] = useState(false);
    const observer = useRef(null);
    const elRef = useRef(null);
    const fnRef = useCallback(
        el => {
            if (el) {
                observer.current = new IntersectionObserver(
                    ([{ isIntersecting }]) => {
                        setInView(isIntersecting);
                        if (isIntersecting && once) {
                            observer.current.unobserve(el);
                        }
                    },
                    { root, rootMargin, threshold }
                );
                observer.current.observe(el);
            } else {
                observer.current?.unobserve(elRef.current);
            }
            elRef.current = el;
        },
        [once, root, rootMargin, threshold]
    );
    return [inView, fnRef, elRef];
}
