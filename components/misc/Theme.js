import * as React from 'react';

const LOCALSTORAGE_KEY = 'theme';

const DARK = 'dark';
const LIGHT = 'light';
const AUTO = 'auto';

const defaultTheme = AUTO;
const themes = [AUTO, DARK, LIGHT];
const systemThemeMap = { auto: AUTO, dark: DARK, light: LIGHT };
const defaultThemesDef = { themes, systemThemeMap, defaultTheme };

const ThemeContext = React.createContext();

export const ThemeProvider = ({ themesDef = defaultThemesDef, children }) => {
    const [{ theme, themeValue }, setThemeInternal] = React.useState({
        theme: null,
        themeValue: null,
    });

    const getThemeValue = React.useCallback(
        (theme, isSystemDarkMode) => {
            const { systemThemeMap } = themesDef;
            if (theme === systemThemeMap.auto) {
                if (typeof isSystemDarkMode === 'undefined') {
                    const mql = window.matchMedia(
                        '(prefers-color-scheme: dark)'
                    );
                    isSystemDarkMode = mql.matches;
                }
                return isSystemDarkMode
                    ? systemThemeMap.dark
                    : systemThemeMap.light;
            }
            return theme;
        },
        [themesDef]
    );

    const applyTheme = React.useCallback(
        (theme, isSystemDarkMode) => {
            const themeValue = getThemeValue(theme, isSystemDarkMode);
            document.documentElement.dataset.theme = themeValue;
            setThemeInternal({ theme, themeValue });
        },
        [getThemeValue]
    );

    const setTheme = React.useCallback(
        theme => {
            localStorage.setItem(LOCALSTORAGE_KEY, theme);
            applyTheme(theme);
        },
        [applyTheme]
    );

    React.useEffect(() => {
        const mql = window.matchMedia('(prefers-color-scheme: dark)');
        const saved = window.localStorage.getItem(LOCALSTORAGE_KEY);
        const themeNew = saved ?? themesDef.defaultTheme;
        const themeValueNew = getThemeValue(themeNew, mql.matches);
        if (themeNew !== theme || themeValueNew !== themeValue) {
            setThemeInternal({ theme: themeNew, themeValue: themeValueNew });
        }
        const handleChange = event => {
            applyTheme(theme, event.matches);
        };
        mql.addEventListener('change', handleChange);
        return () => mql.removeEventListener('change', handleChange);
    }, [theme, themeValue, themesDef, getThemeValue, applyTheme]);

    return (
        <ThemeContext.Provider value={{ theme, themeValue, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => React.useContext(ThemeContext);

export const ThemeScript = ({ themesDef = defaultThemesDef }) => {
    const themeScript = `
        (function() {
            const themesDef = ${JSON.stringify(themesDef)};
            function getThemeValue() {
                const saved = window.localStorage.getItem('${LOCALSTORAGE_KEY}');
                const theme = saved ?? themesDef.defaultTheme;
                if (theme === themesDef.systemThemeMap.auto) {
                    const mql = window.matchMedia('(prefers-color-scheme: dark)');
                    return mql.matches ? themesDef.systemThemeMap.dark : themesDef.systemThemeMap.light;
                }
                return theme;
            }
            const themeValue = getThemeValue();
            document.documentElement.dataset.theme = themeValue;
        })();
    `;
    return <script dangerouslySetInnerHTML={{ __html: themeScript }} />;
};
