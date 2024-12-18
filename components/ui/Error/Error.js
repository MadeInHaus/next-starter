import PropTypes from 'prop-types';

import Head from 'components/misc/Head';

import styles from './Error.module.css';

const Error = ({ statusCode, message }) => {
    return (
        <div className={styles.root}>
            <Head title={`${statusCode} | ${message}`} />
            <p>{statusCode}</p>
        </div>
    );
};

Error.propTypes = {
    message: PropTypes.string,
    statusCode: PropTypes.number,
};

export default Error;
