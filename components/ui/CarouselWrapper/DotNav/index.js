import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Dot from './Dot';
import styles from './DotNav.module.scss';
import { mappable } from 'utils';

const DotNav = ({ index, itemsLength, className, setIndex }) => {
    const infiniteIndexNegativeMod = (index % -itemsLength) + itemsLength;
    const infiniteIndexNegative =
        infiniteIndexNegativeMod === itemsLength ? 0 : infiniteIndexNegativeMod;
    const infiniteIndexPositive = index % itemsLength;
    const infiniteIndex =
        index < 0 ? infiniteIndexNegative : infiniteIndexPositive;

    return (
        <div className={cx(styles.root, className)}>
            <div className={styles.dotNav}>
                {mappable(itemsLength).map((_, i) => (
                    <Dot
                        key={i}
                        index={infiniteIndex}
                        i={i}
                        setIndex={setIndex}
                    />
                ))}
            </div>
        </div>
    );
};

DotNav.propTypes = {
    index: PropTypes.number,
    itemsLength: PropTypes.number,
    className: PropTypes.string,
    flexDirection: PropTypes.string,
};

DotNav.defaultProps = {
    flexDirection: 'row',
};

export default DotNav;
