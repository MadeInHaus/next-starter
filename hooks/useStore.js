import { create } from 'zustand';

const useStore = create(set => ({
    counter: 0,
    resetCounter: () => set({ counter: 0 }),
    incrementCounter: () => set(state => ({ counter: state.counter + 1 })),
}));

export default useStore;
