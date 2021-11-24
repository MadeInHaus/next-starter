import { useState, useCallback, useRef } from 'react';

const useImageLoader = () => {
    const [loaded, setLoaded] = useState(false);
    const elRef = useRef();
    const handleLoad = useCallback(() => {
        elRef.current?.removeEventListener('load', handleLoad);
        setLoaded(true);
    }, []);
    const fnRef = useCallback(
        el => {
            if (el) {
                if (el.complete && el.naturalWidth && el.naturalHeight) {
                    handleLoad();
                } else {
                    el.addEventListener('load', handleLoad);
                }
            } else {
                elRef.current?.removeEventListener('load', handleLoad);
            }
            elRef.current = el;
        },
        [handleLoad]
    );
    return [loaded, fnRef, elRef];
}

export default useImageLoader;
