import React, { forwardRef, Fragment, memo } from 'react';
import PropTypes from 'prop-types';

// This component requires Contentful's Image API
// Inspiration: https://www.contentful.com/blog/2019/10/31/webp-source-sets-images-api/

const DEFAULT_WIDTH = 640;
const MAX_WIDTH = 2560;

const noFallbackImageWarning = `ContentfulImg.js: For optimization purposes, it is *highly recommended* that you set a fallbackImageWidth prop. This prop currently has a default value of ${DEFAULT_WIDTH}px which may not be an optimal value for this image. This value is used if WebP isn't supported (i.e. Safari) and/or you aren't defining a customSources prop. Don't waste precious bytes!`;

const ImgOptimized = forwardRef(
    (
        {
            alt,
            className,
            imgClassName,
            customSources,
            fallbackImageWidth,
            loading,
            onLoad,
            src: ogSrc,
            ...props
        },
        ref
    ) => {
        if (ogSrc == null) return null;

        if (!fallbackImageWidth && !props.width) {
            console.warn(noFallbackImageWarning);
        }

        const fallbackWidth = Math.min(
            fallbackImageWidth || props.width || DEFAULT_WIDTH,
            MAX_WIDTH
        );

        return (
            <picture className={className}>
                <CustomSources sources={customSources} ogSrc={ogSrc} />
                <source
                    srcSet={`${ogSrc}?w=${fallbackWidth}&fm=webp&q=90`}
                    type="image/webp"
                />
                <img
                    {...props}
                    ref={ref}
                    alt={alt}
                    src={`${ogSrc}?w=${fallbackWidth}&q=90`}
                    loading={loading}
                    decoding="async"
                    onLoad={onLoad}
                    onError={onLoad}
                    className={imgClassName}
                />
            </picture>
        );
    }
);

const CustomSources = ({ sources, ogSrc }) =>
    sources?.map(({ breakpoint, imageWidth, src: breakpointSrc }, i) => {
        // Max image values at 2560px to keep Contentful's Image API happy
        const w = Math.min(imageWidth, MAX_WIDTH);
        const src = breakpointSrc || ogSrc;
        const webpSrc = `${src}?w=${w}&fm=webp&q=80`;
        const defaultSrc = `${src}?w=${w}&q=90`;
        const media = breakpoint ? `(min-width: ${breakpoint}px)` : null;
        return (
            <Fragment key={i}>
                <source media={media} srcSet={webpSrc} type="image/webp" />
                <source media={media} srcSet={defaultSrc} />
            </Fragment>
        );
    }) ?? [];

ImgOptimized.propTypes = {
    alt: PropTypes.string,
    className: PropTypes.string,
    imgClassName: PropTypes.string,
    customSources: PropTypes.arrayOf(
        PropTypes.shape({
            breakpoint: PropTypes.number,
            imageWidth: PropTypes.number,
            src: PropTypes.string,
        })
    ),
    fallbackImageWidth: PropTypes.number,
    loading: PropTypes.string,
    onLoad: PropTypes.func,
    src: PropTypes.string,
};

ImgOptimized.defaultProps = {
    alt: '',
    className: null,
    imgClassName: null,
    customSources: null,
    fallbackImageWidth: null,
    loading: 'auto',
};

export default memo(ImgOptimized);
