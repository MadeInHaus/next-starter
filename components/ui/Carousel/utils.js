const isUndef = v => isNaN(v) || typeof v === 'undefined';

export function getCSSValues(container) {
    const GAP = '--carousel-gap';
    const SNAP = '--carousel-snap-position';
    const SNAPSTART = '--carousel-snap-position-start';
    const SNAPEND = '--carousel-snap-position-end';
    const WIDTH = '--carousel-item-width';
    const SCROLL = '--carousel-autoscroll';
    const DISABLED = '--carousel-disabled';
    const SNAPBACK_THRESHOLD = '--carousel-snap-back-threshold';
    const MAX_SNAP_VELOCITY = '--carousel-max-snap-overshoot-velocity';
    const dummy = document.createElement('div');
    const styles = [
        `position: relative`,
        `padding-left: var(${GAP})`,
        `padding-right: var(${SNAP})`,
        `margin-left: var(${SNAPSTART})`,
        `margin-right: var(${SNAPEND})`,
        `left: var(${WIDTH})`,
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
    const width = parseFloat(computed.getPropertyValue('left'));
    const autoScroll = parseFloat(computed.getPropertyValue(SCROLL)) || 0;
    const disabled = parseInt(computed.getPropertyValue(DISABLED), 10) ? 1 : 0;
    const snapbackThreshold = parseInt(
        computed.getPropertyValue(SNAPBACK_THRESHOLD),
        10
    );
    const maxSnapOvershootVelocity = parseInt(
        computed.getPropertyValue(MAX_SNAP_VELOCITY),
        10
    );
    container.removeChild(dummy);
    return {
        gap: hasGap && !isUndef(gap) ? gap : undefined,
        snap: hasSnap && !isUndef(snap) ? snap : undefined,
        snapStart: hasSnapStart && !isUndef(snapStart) ? snapStart : undefined,
        snapEnd: hasSnapEnd && !isUndef(snapEnd) ? snapEnd : undefined,
        width: hasWidth && !isUndef(width) ? width : undefined,
        autoScroll,
        disabled,
        snapbackThreshold,
        maxSnapOvershootVelocity,
    };
}

// Real modulo
export function modulo(a, b) {
    return ((a % b) + b) % b;
}

// Get the last item of an array
export function last(array) {
    return typeof array !== 'undefined' && Array.isArray(array)
        ? array[array.length - 1]
        : undefined;
}

// Create an array of specified size
// Initialized with numbers 0 .. size-1
export function mappable(size) {
    return new Array(size).fill(0).map((_, i) => i);
}

export function sign(value) {
    return value < 0 ? -1 : 1;
}

export function clamp(value, bound1, bound2) {
    const from = Math.min(bound1, bound2);
    const to = Math.max(bound1, bound2);
    return Math.max(Math.min(value, to), from);
}

export function hermite(time, from = 0, to = 1, timeStart = 0, timeEnd = 1) {
    time = clamp(time, timeStart, timeEnd);
    const t = (time - timeStart) / (timeEnd - timeStart);
    return (-2 * t * t * t + 3 * t * t) * (to - from) + from;
}
