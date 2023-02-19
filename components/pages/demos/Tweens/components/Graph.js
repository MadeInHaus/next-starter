import * as React from 'react';
import cx from 'classnames';

import styles from './Graph.module.scss';

const Graph = ({
    cp1x,
    cp1y,
    cp2x,
    cp2y,
    width,
    height,
    paddingTop,
    paddingRight,
    paddingBottom,
    paddingLeft,
    className,
    onChange,
}) => {
    const cps = { cp1x, cp1y, cp2x, cp2y };
    const cp1 = { cx: cp1x, cy: cp1y };
    const cp2 = { cx: cp2x, cy: cp2y };
    const tx = paddingLeft;
    const ty = height - paddingBottom;
    const sx = width - paddingLeft - paddingRight;
    const sy = -height + paddingTop + paddingBottom;
    const transform = `translate(${tx} ${ty}) scale(${sx} ${sy})`;
    const handleCPChange = cp => (x, y) => {
        if (onChange) {
            if (cp === 1) {
                onChange(x, y, cp2x, cp2y);
            } else {
                onChange(cp1x, cp1y, x, y);
            }
        }
    };
    return (
        <svg
            viewBox={`0 0 ${width} ${height}`}
            className={cx(styles.svg, className)}
        >
            <g transform={transform}>
                <Grid height={height} />
                <BezierHull {...cps} />
                <ControlPoint {...cp1} onChange={handleCPChange(1)} />
                <ControlPoint {...cp2} onChange={handleCPChange(2)} />
                <Bezier {...cps} />
            </g>
        </svg>
    );
};

const Bezier = ({ cp1x, cp1y, cp2x, cp2y }) => {
    return (
        <path
            className={styles.bezier}
            d={`M0 0 c${cp1x} ${cp1y} ${cp2x} ${cp2y} ${1} ${1}`}
        />
    );
};

const BezierHull = ({ cp1x, cp1y, cp2x, cp2y }) => {
    return (
        <path
            className={styles.bezierHull}
            d={`M0 0 L${cp1x} ${cp1y} L${cp2x} ${cp2y} L1 1`}
        />
    );
};

const ControlPoint = ({ cx, cy }) => {
    const radius = 0.02;
    return (
        <g className={styles.controlPoint} transform={`translate(${cx} ${cy})`}>
            <circle cx={0} cy={0} r={radius} />
        </g>
    );
};

const Grid = ({ height }) => {
    return (
        <g>
            {[...Array(10)].map((_, i) => {
                const a = (i + 1) * 0.1;
                return (
                    <g key={i}>
                        {/* ticks and labels x-axis */}
                        <line x1={a} y1={0} x2={a} y2={-0.01} />
                        <text
                            x={a}
                            y={0.04}
                            stroke="none"
                            fill="black"
                            textAnchor="middle"
                            dominantBaseline={'text-top'}
                            fontSize={11 / height}
                            transform={`scale(1 -1)`}
                        >
                            {a.toFixed(1)}
                        </text>
                        {/* ticks and labels y-axis */}
                        <line x1={0} y1={a} x2={-0.01} y2={a} />
                        <text
                            x={-0.02}
                            y={-a}
                            stroke="none"
                            fill="black"
                            textAnchor="end"
                            dominantBaseline={'middle'}
                            fontSize={11 / height}
                            transform={`scale(1 -1)`}
                        >
                            {a.toFixed(1)}
                        </text>
                        <g className={styles.gridLines}>
                            {/* grid line x-axis */}
                            <line x1={0} y1={a} x2={1} y2={a} />
                            {/* grid line y-axis */}
                            <line x1={a} y1={0} x2={a} y2={1} />
                        </g>
                    </g>
                );
            })}
            {/* main x-axis */}
            <line x1="0" y1="0" x2="1.015" y2="0" />
            {/* main y-axis */}
            <line x1="0" y1="0" x2="0" y2="1.015" />
        </g>
    );
};

export default Graph;
