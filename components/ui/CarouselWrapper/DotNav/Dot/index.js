import React from 'react';
import cx from 'classnames';
import styles from './Dot.module.scss';

const Dot = ({ index, i, setIndex, className, backgroundColor }) => {
    const handleClick = e => {
        const index = parseInt(e.currentTarget.getAttribute('data-index'));
        setIndex(index);
    };

    return (
        <button
            className={cx(styles.root, className, {
                [styles.backgroundCashew]: backgroundColor === 'cashew',
                [styles.backgroundKale]: backgroundColor === 'kale',
                [styles.isActive]: i === index,
            })}
            data-index={i}
            onClick={handleClick}
        >
            <span className={styles.dotInner}>
                <span>{i}</span>
            </span>
        </button>
    );
};

export default Dot;
