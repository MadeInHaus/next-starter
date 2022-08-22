import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import styles from './Arrow.module.scss';

const Arrow = ({ children, className, direction, disabled, onClick }) => {
    return (
        <button
            className={cx(styles.button, className, {
                [styles.prev]: direction === 'left',
            })}
            onClick={onClick}
            disabled={disabled}
        >
            <span className="sr-only">{children}</span>
        </button>
    );
};

Arrow.propTypes = {
    className: PropTypes.string,
    direction: PropTypes.string,
    onClick: PropTypes.func,
};

Arrow.defaultProps = {
    direction: 'right',
};

export default Arrow;
