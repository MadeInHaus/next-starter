import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Dot from './Dot';
import styles from './DotNav.module.scss';
import { mappable } from 'utils';

const DotNav = ({ index, itemsLength, className, setIndex }) => {
    return (
        <div className={cx(styles.root, className)}>
            <div className={styles.dotNav}>
                {mappable(itemsLength).map((_, i) => (
                    <Dot key={i} index={index} i={i} setIndex={setIndex} />
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
