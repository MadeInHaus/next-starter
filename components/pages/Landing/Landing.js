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
                        <Text as="span">UseImageLoader</Text>
                    </Link>
                </li>
                <li>
                    <Link href="/demos/intersection-observer">
                        <Text as="span">UseIntersectionObserver</Text>
                    </Link>
                </li>
                <li>
                    <Link href="/demos/intersection-observer#anchor">
                        <Text as="span">UseIntersectionObserver (anchor)</Text>
                    </Link>
                </li>
            </ul>
        </div>
    );
};

export default Landing;
