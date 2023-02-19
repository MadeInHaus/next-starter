import * as React from 'react';

import Graph from './components/Graph';
import Slider from './components/Slider';

import styles from './Tweens.module.scss';

const Tweens = () => {
    const input = 0.5;
    const cp = [0.785, 0.135, 0.15, 0.86];
    const handleGraphChange = (cp1x, cp1y, cp2x, cp2y) => {
        console.log(cp1x, cp1y, cp2x, cp2y);
    };
    const handleSliderChange = (input) => {
        console.log(input);
    };
    return (
        <div className={styles.root}>
            <Graph
                cp1x={cp[0]}
                cp1y={cp[1]}
                cp2x={cp[2]}
                cp2y={cp[3]}
                width={500}
                height={500}
                paddingTop={20}
                paddingRight={20}
                paddingBottom={30}
                paddingLeft={35}
                className={styles.graph}
                onChange={handleGraphChange}
            />
            <Slider
                input={input}
                width={500}
                height={100}
                paddingRight={20}
                paddingLeft={35}
                className={styles.slider}
                onChange={handleSliderChange}
            />
        </div>
    );
};

export default Tweens;
