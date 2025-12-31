import IPODetail from '../../../components/ipo/IPODetail';

export async function generateMetadata({ params }) {
    const { slug } = await params;
    // We don't have a manifest for IPOs yet, so we'll use a generic title or fetch it if possible.
    // For now, let's use the slug to make it unique.
    const decodedSlug = decodeURIComponent(slug).replace(/-/g, ' ');

    return {
        title: `${decodedSlug} IPO Details & Analysis`,
        description: `Get comprehensive details, GMP, and analysis for the ${decodedSlug} IPO. Track live subscription status and important dates.`,
        openGraph: {
            title: `${decodedSlug} IPO Analysis`,
            description: `Live data and details for ${decodedSlug} IPO.`,
        },
    };
}

export default async function Page({ params }) {
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug).replace(/-/g, ' ');

    return (
        <div className="bg-gray-50 min-h-screen pb-12">
            <div className="max-w-5xl mx-auto px-4 md:px-8 py-6">
                <h1 className="sr-only">{decodedSlug} IPO Details & Analysis</h1>
            </div>
            <IPODetail />
        </div>
    );
}
