import { useRef, useEffect } from 'react';

const useEffectAfterFirstRender = (fn, deps) => {
    const firstRender = useRef(true);
    useEffect(() => {
        if (!firstRender.current) {
            fn();
        }
        firstRender.current = false;
    }, deps); // eslint-disable-line react-hooks/exhaustive-deps
}

export default useEffectAfterFirstRender;
