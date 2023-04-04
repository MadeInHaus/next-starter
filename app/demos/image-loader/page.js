import ImageLoader from 'components/pages/demos/ImageLoader';

export async function getData() {
    const res = await fetch(
        'https://dog.ceo/api/breed/schnauzer/miniature/images',
        { next: { revalidate: 60 } }
    );

    // The return value is *not* serialized
    // You can return Date, Map, Set, etc.

    // Recommendation: handle errors
    if (!res.ok) {
        // This will activate the closest `error.js` Error Boundary
        throw new Error('Failed to fetch data');
    }

    return res.json();
}

export default async function Page() {
    const data = await getData();

    return <ImageLoader dogs={data.message} />;
}
