import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Arrow from './Arrow';
import styles from './ArrowNav.module.scss';

const ArrowNav = ({
    className,
    index,
    itemsLength,
    visibleItems,
    setIndex,
}) => {
    const handleClick = direction => () => {
        if (direction === 'next' && index < itemsLength - 1) {
            setIndex(index + 1, direction);
        } else if (direction === 'prev' && index > 0) {
            setIndex(index - 1, direction);
        }
    };

    return (
        <div className={cx(styles.root, className)}>
            <div className={styles.arrowNav}>
                <div className={styles.arrow}>
                    <Arrow
                        setIndex={setIndex}
                        onClick={handleClick('prev')}
                        disabled={index === 0}
                    >
                        prev
                    </Arrow>
                </div>
                <div className={styles.arrow}>
                    <Arrow
                        setIndex={setIndex}
                        onClick={handleClick('next')}
                        disabled={
                            visibleItems
                                ? index === itemsLength - visibleItems
                                : index === itemsLength - 1
                        }
                    >
                        next
                    </Arrow>
                </div>
            </div>
        </div>
    );
};

ArrowNav.propTypes = {
    index: PropTypes.number,
    itemsLength: PropTypes.number,
    className: PropTypes.string,
};

export default ArrowNav;
