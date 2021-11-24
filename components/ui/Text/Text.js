import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import styles from './Text.module.scss';

const Text = React.forwardRef((props, ref) => {
    const { as, theme, className, children, ...otherProps } = props;
    return React.createElement(
        as,
        { ref, className: cx(styles[theme], className), ...otherProps },
        children
    );
});

Text.propTypes = {
    as: PropTypes.string,
    theme: PropTypes.string,
    className: PropTypes.string,
    children: PropTypes.node,
};

Text.defaultProps = {
    theme: 'body',
    as: 'p',
};

export default Text;
