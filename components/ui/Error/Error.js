import PropTypes from 'prop-types';

import Head from 'components/misc/Head';
import Text from 'components/ui/Text';

import styles from './Error.module.scss';

const Error = ({ statusCode, message }) => {
    return (
        <div className={styles.root}>
            <Head title={`${statusCode} | ${message}`} />
            <Text>{statusCode}</Text>
        </div>
    );
};

Error.propTypes = {
    message: PropTypes.string,
    statusCode: PropTypes.number,
};

export default Error;
