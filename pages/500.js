import Error from 'components/ui/Error';

export default function Error500() {
    return <Error statusCode={500} message="Server error" />;
}
