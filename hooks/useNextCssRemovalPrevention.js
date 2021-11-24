import { useEffect } from 'react';

export default function useNextCssRemovalPrevention() {
    useEffect(() => {
        document
            .querySelectorAll('head > link[rel="stylesheet"][data-n-p]')
            .forEach(node => {
                node.removeAttribute('data-n-p');
            });

        const mutationHandler = mutations => {
            mutations.forEach(({ target }) => {
                if (target.nodeName === 'STYLE') {
                    if (target.getAttribute('media') === 'x') {
                        target.removeAttribute('media');
                    }
                }
            });
        };

        const observer = new MutationObserver(mutationHandler);

        observer.observe(document.head, {
            subtree: true,
            attributeFilter: ['media'],
        });

        return () => {
            observer.disconnect();
        };
    }, []);
}
