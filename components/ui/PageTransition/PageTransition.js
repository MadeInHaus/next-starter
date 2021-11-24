import {
    createElement,
    forwardRef,
    useRef,
    useState,
    useEffect,
    useCallback,
} from 'react';

import PropTypes from 'prop-types';
import cx from 'classnames';
import { useRouter } from 'next/router';
import { getHash, removeHash } from 'utils';

import usePageTransitionStore, {
    PHASE_IDLE,
    PHASE_APPEAR,
    PHASE_IN,
    PHASE_OUT,
} from 'hooks/usePageTransitionStore';

import styles from './PageTransition.module.scss';

function saveScrollPos(url) {
    const scrollPos = { x: window.scrollX, y: window.scrollY };
    sessionStorage.setItem(url, JSON.stringify(scrollPos));
}

function getScrollPos(url) {
    const scrollPos = JSON.parse(sessionStorage.getItem(url)) ?? {};
    return { x: 0, y: 0, ...scrollPos };
}

const FADE_IN_DURATION = 500;
const FADE_OUT_DURATION = 500;

const PageTransition = forwardRef(({ as, className, children }, ref) => {
    const router = useRouter();
    const nextChild = useRef(null);
    const timeout = useRef(null);
    const scrollPos = useRef(null);
    const doRestoreScroll = useRef(false);

    const [currentChild, setCurrentChild] = useState(children);

    const phase = usePageTransitionStore(state => state.phase);
    const _updateState = usePageTransitionStore(state => state.update);

    const updateState = useCallback(
        ({ phase, from, to, phaseOutAnticipated = false }) => {
            const newState = {
                phaseOutAnticipated,
                targetUrl: removeHash(router.asPath),
                scrollPosY: scrollPos.current?.y ?? 0,
            };
            if (phase) newState.phase = phase;
            if (from) newState.currentUrl = removeHash(from);
            if (to) newState.targetUrl = removeHash(to);
            _updateState(newState);
        },
        [router.asPath, _updateState]
    );

    useEffect(() => {
        if ('scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'manual';

            const onBeforeUnload = event => {
                saveScrollPos(router.asPath);
                delete event.returnValue;
            };

            const onRouteChangeStart = url => {
                scrollPos.current = doRestoreScroll.current
                    ? getScrollPos(url)
                    : { x: 0, y: 0, hash: getHash(url) };
                saveScrollPos(router.asPath);
                if (url !== router.asPath) {
                    updateState({
                        phaseOutAnticipated: true,
                        from: router.asPath,
                        to: url,
                    });
                }
                doRestoreScroll.current = false;
            };

            window.addEventListener('beforeunload', onBeforeUnload);
            router.events.on('routeChangeStart', onRouteChangeStart);
            router.beforePopState(state => {
                state.options.scroll = false;
                scrollPos.current = null;
                doRestoreScroll.current = true;
                return true;
            });

            return () => {
                window.removeEventListener('beforeunload', onBeforeUnload);
                router.events.off('routeChangeStart', onRouteChangeStart);
                router.beforePopState(() => true);
            };
        }
    }, [router, updateState]);

    useEffect(() => {
        const handleOutComplete = () => {
            const _nextChild = nextChild.current;
            const nextPhase = _nextChild ? PHASE_APPEAR : PHASE_IDLE;
            nextChild.current = null;
            setCurrentChild(_nextChild);
            updateState({ phase: nextPhase });
        };

        const handleInComplete = () => {
            updateState({ phase: PHASE_IDLE });
        };

        const transitionOut = next => {
            nextChild.current = next;
            clearTimeout(timeout.current);
            timeout.current = setTimeout(handleOutComplete, FADE_OUT_DURATION);
            updateState({ phase: PHASE_OUT });
        };

        const transitionIn = () => {
            if (scrollPos.current?.hash) {
                const el = document.querySelector(scrollPos.current.hash);
                const style = window.getComputedStyle(el);
                const margin = style.getPropertyValue('scroll-margin-top');
                const { top } = el.getBoundingClientRect();
                const { scrollTop } = document.scrollingElement;
                const y = top + scrollTop - (margin ? parseFloat(margin) : 0);
                window.scrollTo(0, y);
            } else {
                const { x, y } = scrollPos.current ?? { x: 0, y: 0 };
                window.scrollTo(x, y);
            }
            clearTimeout(timeout.current);
            timeout.current = setTimeout(handleInComplete, FADE_IN_DURATION);
            updateState({ phase: PHASE_IN });
        };

        switch (phase) {
            case PHASE_APPEAR:
                transitionIn();
                break;
            case PHASE_IDLE:
                if (children.key !== currentChild.key) {
                    transitionOut(children);
                }
                break;
            case PHASE_OUT:
                nextChild.current = children;
                break;
            case PHASE_IN:
                if (children !== currentChild) {
                    if (children.key !== currentChild.key) {
                        transitionOut(children);
                    } else {
                        setCurrentChild(children);
                    }
                }
                break;
        }
    }, [phase, currentChild, children]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        return () => {
            clearTimeout(timeout.current);
        };
    }, []);

    return createElement(
        as,
        { ref, className: cx(styles.root, className) },
        currentChild
    );
});

PageTransition.propTypes = {
    as: PropTypes.string,
    className: PropTypes.string,
    children: PropTypes.node,
};

PageTransition.defaultProps = {
    as: 'main',
};

export default PageTransition;
