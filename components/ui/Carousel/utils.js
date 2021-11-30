export const isUndef = v => isNaN(v) || typeof v === 'undefined';

export function getCSSValues(container) {
    const GAP = '--carousel-gap';
    const SNAP = '--carousel-snap-position';
    const WIDTH = '--carousel-item-width';
    const dummy = document.createElement('div');
    const styles = [
        `margin-left: var(${GAP})`,
        `margin-right: var(${SNAP})`,
        `width: var(${WIDTH})`,
    ];
    dummy.setAttribute('style', styles.join(';'));
    container.appendChild(dummy);
    const computed = getComputedStyle(dummy);
    const hasGap = computed.getPropertyValue(GAP) !== '';
    const hasSnap = computed.getPropertyValue(SNAP) !== '';
    const hasWidth = computed.getPropertyValue(WIDTH) !== '';
    if (!hasGap && !hasSnap && !hasWidth) {
        return {};
    }
    const gap = parseFloat(computed.getPropertyValue('margin-left'));
    const snap = parseFloat(computed.getPropertyValue('margin-right'));
    const width = parseFloat(computed.getPropertyValue('width'));
    container.removeChild(dummy);
    return {
        gap: hasGap && !isUndef(gap) ? gap : undefined,
        snap: hasSnap && !isUndef(snap) ? snap : undefined,
        width: hasWidth && !isUndef(width) ? width : undefined,
    };
}
