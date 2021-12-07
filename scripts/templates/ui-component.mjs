export const uiComponentJS = name => `import PropTypes from 'prop-types';
import cx from 'classnames';

import styles from './${name}.module.scss';

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

export const uiComponentSCSS = () => `@import 'styles/breakpoints';
@import 'styles/fonts';

.root {
}
`;

export const uiComponentIndex = name => `export { default } from './${name}';
`;
