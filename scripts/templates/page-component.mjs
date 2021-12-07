export const pageComponentRoute = name => {
    return `export { default } from 'components/pages/${name}';
`;
};

export const pageComponentJS = name => {
    return `// import PropTypes from 'prop-types';

import styles from './${name}.module.scss';

const ${name} = () => {
    return (
        <div className={styles.root}>

        </div>
    );
};

${name}.propTypes = {
};

export default ${name};
`;
};

export const pageComponentSCSS = () => {
    return `@import 'styles/breakpoints';
@import 'styles/fonts';

.root {
}
`;
};

export const pageComponentIndex = name => {
    return `export { default } from './${name}';
`;
};
