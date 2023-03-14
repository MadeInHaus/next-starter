import * as React from 'react';
import cx from 'clsx';

import Portal from '@madeinhaus/portal';

import grid from 'styles/modules/grid.module.scss';
import styles from './GridOverlay.module.scss';

const GridOverlay = () => {
    const [visible, setVisible] = React.useState(false);
    const isProduction = process.env.NODE_ENV === 'production';

    React.useEffect(() => {
        const handleKey = event => {
            if (
                !isProduction &&
                event.target.nodeName.toLowerCase() !== 'input' &&
                event.keyCode === 103
            ) {
                setVisible(!visible);
            }
        };
        document.addEventListener('keypress', handleKey);
        return () => document.removeEventListener('keypress', handleKey);
    });

    if (isProduction) {
        return null;
    }

    const className = cx(styles.gridOverlay, grid.container, {
        [styles.visible]: visible,
    });

    return (
        <Portal selector="#__gridoverlay_portal__">
            <div className={className}>
                {Array.from({ length: 12 }).map((_, i) => {
                    const className = cx(styles.col, styles[`col${i + 1}`]);
                    return <div key={i} className={className} />;
                })}
            </div>
        </Portal>
    );
};

export default GridOverlay;
