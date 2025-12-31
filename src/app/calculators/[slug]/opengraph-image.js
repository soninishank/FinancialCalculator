import { ImageResponse } from 'next/og';
import manifest from '../../../utils/calculatorsManifest';

export const runtime = 'edge';

export const size = {
    width: 1200,
    height: 630,
};
export const contentType = 'image/png';

export default async function Image({ params }) {
    const { slug } = await params;
    const calculator = manifest.find((c) => c.slug === slug);

    const title = calculator ? calculator.title : 'Financial Calculator';
    const category = calculator ? calculator.category : 'Finance';

    return new ImageResponse(
        (
            <div
                style={{
                    background: 'linear-gradient(to bottom right, #f0f9ff, #e0e7ff)',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'sans-serif',
                    position: 'relative',
                }}
            >
                {/* Background Decorative Circles */}
                <div style={{ position: 'absolute', top: -100, left: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(20, 184, 166, 0.1)', filter: 'blur(80px)' }} />
                <div style={{ position: 'absolute', bottom: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(79, 70, 229, 0.1)', filter: 'blur(80px)' }} />

                {/* Brand Header */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 60,
                        opacity: 0.8
                    }}
                >
                    <div
                        style={{
                            width: 40,
                            height: 40,
                            background: 'linear-gradient(to bottom right, #14b8a6, #4f46e5)',
                            borderRadius: 10,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 12,
                        }}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 900, color: '#111827', letterSpacing: '-0.05em' }}>
                        Hash<span style={{ color: '#4f46e5' }}>matic</span>
                    </div>
                </div>

                {/* Main Content */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', maxWidth: 900 }}>
                    <div style={{
                        fontSize: 20,
                        fontWeight: 700,
                        color: '#4f46e5',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        background: 'rgba(79, 70, 229, 0.1)',
                        padding: '8px 20px',
                        borderRadius: 50,
                        marginBottom: 24
                    }}>
                        {category}
                    </div>
                    <div style={{ fontSize: 72, fontWeight: 900, color: '#111827', lineHeight: 1.1, marginBottom: 20 }}>
                        {title}
                    </div>
                    <div style={{ fontSize: 24, color: '#6b7280' }}>
                        Free, precise, and instant calculation.
                    </div>
                </div>
            </div>
        ),
        {
            ...size,
            alt: `${title} - Hashmatic Financial Calculator`,
        }
    );
}
