import * as React from 'react';
import cx from 'classnames';

import styles from './Slider.module.scss';

const Slider = ({
    input,
    width,
    height,
    paddingRight,
    paddingLeft,
    className,
}) => {
    const paddingBottom = 10;
    const paddingTop = 10;
    const tx = paddingLeft;
    const ty = height - paddingBottom;
    const sx = width - paddingLeft - paddingRight;
    const sy = -height + paddingTop + paddingBottom;
    const transform = `translate(${tx} ${ty}) scale(${sx} ${sy})`;
    return (
        <svg
            viewBox={`0 0 ${width} ${height}`}
            className={cx(styles.svg, className)}
        >
            <g transform={transform}>
                <circle cx={input} cy={0} r={0.02} />
            </g>
        </svg>
    );
};

export default Slider;
