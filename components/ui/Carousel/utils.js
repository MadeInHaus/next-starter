export const isUndef = v => isNaN(v) || typeof v === 'undefined';

export function getCSSValues(container) {
    const GAP = '--carousel-gap';
    const SNAP = '--carousel-snap-position';
    const SNAPSTART = '--carousel-snap-position-start';
    const SNAPEND = '--carousel-snap-position-end';
    const WIDTH = '--carousel-item-width';
    const dummy = document.createElement('div');
    const styles = [
        `padding-left: var(${GAP})`,
        `padding-right: var(${SNAP})`,
        `margin-left: var(${SNAPSTART})`,
        `margin-right: var(${SNAPEND})`,
        `height: var(${WIDTH})`,
    ];
    dummy.setAttribute('style', styles.join(';'));
    container.appendChild(dummy);
    const computed = getComputedStyle(dummy);
    const hasGap = computed.getPropertyValue(GAP) !== '';
    const hasSnap = computed.getPropertyValue(SNAP) !== '';
    const hasSnapStart = computed.getPropertyValue(SNAPSTART) !== '';
    const hasSnapEnd = computed.getPropertyValue(SNAPEND) !== '';
    const hasWidth = computed.getPropertyValue(WIDTH) !== '';
    const gap = parseFloat(computed.getPropertyValue('padding-left'));
    const snap = parseFloat(computed.getPropertyValue('padding-right'));
    const snapStart = parseFloat(computed.getPropertyValue('margin-left'));
    const snapEnd = parseFloat(computed.getPropertyValue('margin-right'));
    const width = parseFloat(computed.getPropertyValue('height'));
    container.removeChild(dummy);
    return {
        gap: hasGap && !isUndef(gap) ? gap : undefined,
        snap: hasSnap && !isUndef(snap) ? snap : undefined,
        snapStart: hasSnapStart && !isUndef(snapStart) ? snapStart : undefined,
        snapEnd: hasSnapEnd && !isUndef(snapEnd) ? snapEnd : undefined,
        width: hasWidth && !isUndef(width) ? width : undefined,
    };
}
