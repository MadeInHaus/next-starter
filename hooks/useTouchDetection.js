import { useEffect } from 'react';
import create from 'zustand';

const useStore = create(set => ({
    isTouch: false,
    setIsTouch: isTouch => set({ isTouch }),
}));

export const useIsTouch = () => {
    return useStore(state => state.isTouch);
}

const useTouchDetection = () => {
    const setIsTouch = useStore(state => state.setIsTouch);
    useEffect(() => {
        setIsTouch(
            window.matchMedia('(hover: none) and (pointer: coarse)').matches
        );
    }, [setIsTouch]);
};

export default useTouchDetection;
