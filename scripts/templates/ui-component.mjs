export const uiComponentJS = name => `import * as React from 'react';
import PropTypes from 'prop-types';
import cx from 'clsx';

import styles from './${name}.module.css';

const ${name} = ({ className }) => {
    return (
        <div className={cx(styles.root, className)}>

        </div>
    );
};

${name}.propTypes = {
    className: PropTypes.string,
};

export default ${name};
`;

export const uiComponentCSS = () => `.root {
}

@media (width >= 768px) {
}

@media (width >= 1280px) {
}

@media (width >= 1920px) {
}
`;

export const uiComponentIndex = name => `export { default } from './${name}';
`;
