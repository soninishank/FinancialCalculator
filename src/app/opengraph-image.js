import { ImageResponse } from 'next/og';



// Image metadata
export const alt = 'Hashmatic - Free Online Financial Calculators';
export const size = {
    width: 1200,
    height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
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
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 40,
                    }}
                >
                    {/* Logo Icon */}
                    <div
                        style={{
                            width: 80,
                            height: 80,
                            background: 'linear-gradient(to bottom right, #14b8a6, #4f46e5)',
                            borderRadius: 20,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 20,
                            boxShadow: '0 10px 25px -5px rgba(20, 184, 166, 0.4)',
                        }}
                    >
                        <svg
                            width="48"
                            height="48"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                    </div>

                    {/* Logo Text */}
                    <div style={{ display: 'flex', fontSize: 80, fontWeight: 900, color: '#111827', letterSpacing: '-0.05em' }}>
                        Hash<span style={{ color: '#4f46e5' }}>matic</span>
                    </div>
                </div>

                <div style={{ fontSize: 32, fontWeight: 500, color: '#4b5563', maxWidth: 800, textAlign: 'center', lineHeight: 1.4 }}>
                    Free, precise, and beautifully designed financial tools.
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
