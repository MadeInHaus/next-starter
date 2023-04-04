import PropTypes from 'prop-types';

import Text from 'components/ui/Text';

import styles from './Error.module.scss';

const Error = ({ statusCode }) => {
    return (
        <div className={styles.root}>
            <Text>{statusCode}</Text>
        </div>
    );
};

Error.propTypes = {
    message: PropTypes.string,
    statusCode: PropTypes.number,
};

export default Error;
