// Real modulo
export function modulo(a, b) {
    return ((a % b) + b) % b;
}

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
    return (new URL(url, 'http://a')).hash;
}
