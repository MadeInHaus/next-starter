import PropTypes from 'prop-types';
import Head from 'next/head';

const PageHead = ({
    title,
    description,
    image,
    url,
    preloads,
}) => {
    return (
        // prettier-ignore
        <Head>
            <title key="title">{title}</title>
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
            <meta key="description" name="description" content={description} />
            <meta key="og-description" property="og:description" content={description} />
            {image && <meta key="og-image" property="og:image" content={image} />}
            <meta key="og-url" property="og:url" content={url} />
            <meta key="og-type" property="og:type" content="website" />
            <meta key="tw-card" name="twitter:card" content="summary_large_image" />
            <meta key="tw-creator" name="twitter:creator" content="@madeinhaus" />
            {preloads.map(preload => {
                const props = {
                    rel: "preload",
                    as: "image",
                    ...preload,
                }
                return <link key={preload.href} {...props} />;
            })}
        </Head>
    );
};

PageHead.propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    image: PropTypes.string,
    preloads: PropTypes.arrayOf(
        PropTypes.shape({
            type: PropTypes.string.isRequired,
            href: PropTypes.string.isRequired,
            crossOrigin: PropTypes.string,
        })
    ),
};

PageHead.defaultProps = {
    preloads: [],
};

export default PageHead;
