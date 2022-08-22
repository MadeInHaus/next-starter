import { useFontsLoaded } from 'hooks/useFontLoader';
import { useIsTouch } from 'hooks/useTouchDetection';

import Head from 'components/misc/Head';
import Link from 'components/ui/Link';
import Text from 'components/ui/Text';

import styles from './Landing.module.scss';

const Landing = () => {
    const fontsLoaded = useFontsLoaded();
    const isTouch = useIsTouch();
    console.log(`fontsLoaded: ${fontsLoaded}, isTouch: ${isTouch}`);
    return (
        <div className={styles.root}>
            <Head
                title="HAUS Next.js Starter"
                description="A skeleton Next.js app to quickly get started."
            />
            <ul>
                <li>
                    <Link href="/demos/image-loader">
                        <Text as="a">UseImageLoader</Text>
                    </Link>
                </li>
                <li>
                    <Link href="/demos/intersection-observer">
                        <Text as="a">UseIntersectionObserver</Text>
                    </Link>
                </li>
                <li>
                    <Link href="/demos/intersection-observer#anchor">
                        <Text as="a">UseIntersectionObserver (anchor)</Text>
                    </Link>
                </li>
                <li>
                    <Link href="/demos/carousel">
                        <Text as="a">Carousel</Text>
                    </Link>
                </li>
                <li>
                    <Link href="/demos/carousel-finite">
                        <Text as="a">Carousel Finite</Text>
                    </Link>
                </li>
                <li>
                    <Link href="/demos/carousel-wrapper">
                        <Text as="a">
                            Carousel Wrapper Components (DotNav, ArrowNav)
                        </Text>
                    </Link>
                </li>
                <li>
                    <Link href="/demos/test">
                        <Text as="a">Test</Text>
                    </Link>
                </li>
            </ul>
        </div>
    );
};

export default Landing;
