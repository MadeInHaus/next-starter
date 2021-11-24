import create from 'zustand';

export const PHASE_APPEAR = 'appear';
export const PHASE_IN = 'in';
export const PHASE_OUT = 'out';
export const PHASE_IDLE = 'idle';

const useStore = create(set => ({
    update: stateUpdate => set(state => ({ ...state, ...stateUpdate })),
    phase: PHASE_APPEAR,
    phaseOutAnticipated: false,
    currentUrl: null,
    targetUrl: null,
    scrollPosY: 0,
}));

export const useTransitionState = () => {
    const phase = useStore(state => state.phase);
    const phaseOutAnticipated = useStore(state => state.phaseOutAnticipated);
    const currentUrl = useStore(state => state.currentUrl);
    const targetUrl = useStore(state => state.targetUrl);
    const scrollPosY = useStore(state => state.scrollPosY);
    return { phase, phaseOutAnticipated, currentUrl, targetUrl, scrollPosY };
};

export default useStore;
