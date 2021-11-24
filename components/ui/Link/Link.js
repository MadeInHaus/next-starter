import PropTypes from 'prop-types';
import Link from 'next/link';

const LinkNoScroll = ({ children, href, passHref }) => (
    <Link scroll={false} href={href} passHref={passHref}>
        {children}
    </Link>
);

LinkNoScroll.propTypes = {
    children: PropTypes.node.isRequired,
    href: PropTypes.string.isRequired,
    passHref: PropTypes.bool,
};

LinkNoScroll.defaultProps = {
    passHref: true,
};

export default LinkNoScroll;
