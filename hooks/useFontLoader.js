import { useEffect } from 'react';
import { create } from 'zustand';

const useStore = create(set => ({
    fontsLoaded: false,
    setFontsLoaded: () => set({ fontsLoaded: true }),
}));

export const useFontsLoaded = () => {
    return useStore(state => state.fontsLoaded);
};

const useFontLoader = families => {
    const setFontsLoaded = useStore(state => state.setFontsLoaded);
    useEffect(() => {
        async function loadFonts() {
            const WebFontLoader = (await import('webfontloader')).default;
            WebFontLoader.load({
                active: () => setFontsLoaded(),
                inactive: () => setFontsLoaded(),
                custom: { families },
                classes: false,
            });
        }
        loadFonts();
    }, [families, setFontsLoaded]);
};

export default useFontLoader;
