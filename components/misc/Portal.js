import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';

const Portal = ({ selector, children }) => {
    const [element, setElement] = useState(null);

    useEffect(() => {
        setElement(document.querySelector(selector));
    }, [selector]);

    if (element) {
        return ReactDOM.createPortal(children, element);
    }

    return null;
};

Portal.propTypes = {
    selector: PropTypes.string,
    children: PropTypes.node,
};

Portal.defaultProps = {
    selector: '#__portal__',
};

export default Portal;
