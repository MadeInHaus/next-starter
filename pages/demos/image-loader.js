export async function getStaticProps() {
    const api = 'https://dog.ceo/api/breed/schnauzer/miniature/images';
    const apiResponse = await fetch(api);
    const { message: dogs } = await apiResponse.json();
    return { props: { dogs } };
}

export { default } from 'components/pages/demos/ImageLoader';
