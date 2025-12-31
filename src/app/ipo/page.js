import IPOTracker from '../../pages/IPOTRackerPage';

export const metadata = {
    title: 'Live IPO Tracker - NSE Mainboard & SME IPOs',
    description: 'Track latest, upcoming, and closed IPOs on NSE and BSE. Get real-time status updates for Mainboard and SME issues.',
    keywords: ['ipo tracker', 'nse ipo', 'bse ipo', 'live ipo', 'mainboard ipo', 'sme ipo', 'ipo analysis'],
    openGraph: {
        title: 'Live IPO Analysis & Tracker',
        description: 'Track the latest Mainboard and SME IPOs in real-time.',
        type: 'website',
    },
};

export default function Page() {
    return (
        <div className="max-w-7xl mx-auto px-6 py-8">
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight mb-2">
                Live <span className="text-indigo-600">IPO Tracker</span>
            </h1>
            <p className="text-gray-500 text-lg mb-8">Real-time status of Mainboard & SME issues on NSE/BSE.</p>
            <IPOTracker />
        </div>
    );
}
