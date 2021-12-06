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

export function removeHash(url) {
    const urlBase = 'http://a';
    const urlObj = new URL(url, urlBase);
    if (urlObj.origin !== urlBase) {
        urlObj.hash = '';
        return urlObj.toString();
    }
    return `${urlObj.pathname}${urlObj.search}`;
}

export function getHash(url) {
    return new URL(url, 'http://a').hash;
}
