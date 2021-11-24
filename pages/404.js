import Error from 'components/ui/Error';

export default function Error404() {
    return <Error statusCode={404} message="Not found" />;
}
