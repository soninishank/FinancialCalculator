import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { moneyFormat } from "../../utils/formatting";
import { getRegistrarAllotmentLink } from "../../utils/registrarUtils";
import BiddingChart from './BiddingChart';
import SubscriptionStats from './SubscriptionStats';

export default function IPODetail() {
    const { symbol } = useParams();
    const navigate = useNavigate();
    const [ipo, setIpo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchDetail() {
            try {
                // Determine series if known? For now just fetch default or whatever endpoint handles
                // Endpoint handles series param, but we might not know it from URL yet. 
                // We could pass it in state or context, but usually symbol is enough if we fetch smart.
                // Our backend handles it.
                // Use environment variable or fallback
                const baseUrl = process.env.REACT_APP_IPO_API_URL || "http://localhost:8081/api/ipos";
                const fetchUrl = `${baseUrl.replace(/\/$/, '')}/${symbol}`;
                console.log(`[API] Fetching details for ${symbol} from: ${fetchUrl}`);
                const res = await fetch(fetchUrl);
                const json = await res.json();
                console.log(`[API] Detail response for ${symbol}:`, json.ok ? 'Success' : 'Failed');

                if (json.ok) {
                    setIpo(json.data);
                } else {
                    setError(json.error || 'Failed to fetch details');
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        if (symbol) fetchDetail();
    }, [symbol]);

    if (loading) return <div className="p-10 text-center text-gray-500 animate-pulse">Loading Details...</div>;
    if (error) return <div className="p-10 text-center text-red-500">Error: {error}</div>;
    if (!ipo) return <div className="p-10 text-center">Not Found</div>;

    const {
        company_name, series, issue_type, price_range_low, price_range_high,
        issue_size, issue_start, issue_end, listing_date,
        allotment_finalization_date, refund_initiation_date, demat_credit_date,
        face_value, tick_size, bid_lot, min_order_qty, max_retail_amount, min_investment,
        registrar_name, registrar_email, registrar_website, registrar_phone,
        documents, biddingData, subscription
    } = ipo;

    const filteredDocuments = documents ? documents.filter(doc => {
        const title = doc.title?.trim().toLowerCase() || '';
        return !(
            title.includes('list of mobile applications') ||
            title.includes('video link') ||
            title.includes('processing of asba') ||
            title.includes('e-form') ||
            title.includes('branches of self certified syndicate banks') ||
            title.includes('scsb')
        );
    }) : [];

    // Helper function to enhance document title with descriptive text
    const getEnhancedDocTitle = (title) => {
        if (!title) return title;
        const lowerTitle = title.toLowerCase();
        if (lowerTitle.includes('red herring prospectus')) {
            return `${title} (Final SEBI-Approved Document)`;
        }
        return title;
    };

    const allotmentLink = getRegistrarAllotmentLink(registrar_name);

    const priceRange = (price_range_low && price_range_high)
        ? `Rs.${price_range_low} - Rs.${price_range_high}`
        : (price_range_low ? `Rs.${price_range_low}` : 'TBA');

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8">
            <button
                onClick={() => navigate(-1)}
                className="mb-6 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-100 rounded-lg hover:bg-gray-50 shadow-sm transition-all"
            >
                ← Back
            </button>

            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                {/* Header */}
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-8 py-8 text-white">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">{company_name}</h1>
                            <div className="flex items-center gap-3 mt-3">
                                <span className="px-3 py-1 bg-white/20 text-white rounded-full text-xs font-semibold backdrop-blur-sm border border-white/10 uppercase tracking-widest">
                                    {series === 'SME' || issue_type === 'SME' ? 'SME' : 'EQUITY'}
                                </span>
                            </div>
                        </div>
                        <div className="text-right flex flex-col items-end gap-2">
                            <div>
                                <p className="text-gray-400 text-[10px] font-medium uppercase tracking-widest mb-1">Price Range</p>
                                <p className="text-2xl font-bold text-white">{priceRange}</p>
                            </div>
                            {min_investment && (
                                <div className="bg-white/10 px-4 py-2 rounded-2xl border border-white/10 backdrop-blur-sm self-end">
                                    <p className="text-blue-300 text-[10px] font-bold uppercase tracking-widest mb-0.5">Min Investment</p>
                                    <p className="text-xl font-black text-white">
                                        {moneyFormat(min_investment, 'INR', false)}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

                    {/* Important Dates */}
                    <div className="col-span-1 lg:col-span-3">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                            Important Dates
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50 rounded-2xl p-6 border border-gray-100">
                            <InfoCard label="Issue Open" value={issue_start ? new Date(issue_start).toDateString() : 'TBA'} />
                            <InfoCard label="Issue Close" value={issue_end ? new Date(issue_end).toDateString() : 'TBA'} />
                            <InfoCard label="Listing Date" value={listing_date ? new Date(listing_date).toDateString() : 'TBA'} />
                        </div>
                    </div>

                    {/* Indicative Timetable - Only show if at least one date is available */}
                    {(allotment_finalization_date || refund_initiation_date || demat_credit_date) && (
                        <div className="col-span-1 lg:col-span-3">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="w-1 h-6 bg-orange-500 rounded-full"></span>
                                Indicative Timetable
                                <span className="text-xs font-normal text-gray-500 ml-2">(From Red Herring Prospectus)</span>
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-orange-50/50 rounded-2xl p-6 border border-orange-100">
                                {allotment_finalization_date && (
                                    <InfoCard
                                        label="Basis of Allotment"
                                        value={new Date(allotment_finalization_date).toDateString()}
                                    />
                                )}
                                {refund_initiation_date && (
                                    <InfoCard
                                        label="Refund Initiation"
                                        value={new Date(refund_initiation_date).toDateString()}
                                    />
                                )}
                                {demat_credit_date && (
                                    <InfoCard
                                        label="Credit to Demat"
                                        value={new Date(demat_credit_date).toDateString()}
                                    />
                                )}
                            </div>
                        </div>
                    )}

                    {/* Issue Details */}
                    <div className="col-span-1 lg:col-span-2 space-y-8">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
                                Issue Details
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                                <DetailRow label="Issue Size" value={
                                    issue_size ? (
                                        <div>
                                            <div className="font-bold">{moneyFormat(issue_size, 'INR', true)}</div>
                                            {(ipo.fresh_issue_size !== undefined || ipo.offer_for_sale_size !== undefined) && (
                                                <div className="text-xs text-gray-500 mt-1 font-normal">
                                                    {ipo.fresh_issue_size !== undefined && <div>Fresh: {moneyFormat(ipo.fresh_issue_size, 'INR', true)}</div>}
                                                    {ipo.offer_for_sale_size !== undefined && <div>OFS: {moneyFormat(ipo.offer_for_sale_size, 'INR', true)}</div>}
                                                </div>
                                            )}
                                        </div>
                                    ) : '-'
                                } />
                                <DetailRow label="Face Value" value={face_value ? `Rs.${face_value}` : '-'} />
                                <DetailRow label="Tick Size" value={tick_size ? `Rs.${tick_size}` : '-'} />
                                <DetailRow label="Bid Lot" value={bid_lot ? `${bid_lot} Shares (and in multiples thereof)` : '-'} />
                                <DetailRow label="Min Order Qty" value={min_order_qty ? `${min_order_qty} Shares` : '-'} />
                                <DetailRow label="Min Investment" value={min_investment ? moneyFormat(min_investment, 'INR', false) : '-'} />
                                <DetailRow label="Max Retail Amount" value={max_retail_amount ? `Rs.${max_retail_amount}` : '-'} />
                            </div>
                        </div>

                        {/* Bidding Chart */}
                        {biddingData && biddingData.length > 0 && (
                            <BiddingChart data={biddingData} />
                        )}

                        {/* Subscription Stats */}
                        {subscription && subscription.length > 0 && (
                            <SubscriptionStats data={subscription} />
                        )}

                        {/* Documents */}
                        {filteredDocuments && filteredDocuments.length > 0 && (
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <span className="w-1 h-6 bg-green-500 rounded-full"></span>
                                    Documents
                                </h2>
                                <div className="flex flex-wrap gap-3">
                                    {filteredDocuments.map((doc, idx) => (
                                        <a
                                            key={idx}
                                            href={doc.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center px-4 py-2 rounded-lg border border-gray-100 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors shadow-sm"
                                        >
                                            📄 {getEnhancedDocTitle(doc.title)}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Registrar Info */}
                    <div className="col-span-1">
                        <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="w-1 h-6 bg-indigo-500 rounded-full"></span>
                                Registrar
                            </h2>
                            {registrar_name ? (
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-gray-900">{registrar_name}</h3>
                                    {registrar_phone && (
                                        <p className="text-sm text-gray-600 flex items-center gap-2">
                                            📞 {registrar_phone}
                                        </p>
                                    )}
                                    {registrar_email && (
                                        <p className="text-sm text-gray-600 flex items-start gap-2 break-all">
                                            ✉️ {registrar_email}
                                        </p>
                                    )}
                                    {(() => {
                                        let primaryLink = allotmentLink;
                                        let linkLabel = "🎯 Check Allotment Status";

                                        // If no dedicated allotment link, fallback to main website
                                        if (!primaryLink && registrar_website) {
                                            primaryLink = registrar_website.startsWith('http') ? registrar_website : `https://${registrar_website}`;
                                            linkLabel = "🌐 Visit Registrar Website";
                                        }

                                        // If neither, fallback to Google Search
                                        if (!primaryLink) {
                                            const query = encodeURIComponent(`${registrar_name} IPO allotment status`);
                                            primaryLink = `https://www.google.com/search?q=${query}`;
                                            linkLabel = "🔍 Search Allotment Status";
                                        }

                                        return (
                                            <a
                                                href={primaryLink}
                                                target="_blank"
                                                rel="noreferrer"
                                                className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 mt-2 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm w-full ${!allotmentLink && !registrar_website ? 'bg-gray-600 hover:bg-gray-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                                            >
                                                {linkLabel}
                                            </a>
                                        );
                                    })()}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 italic">No Info Available</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const InfoCard = ({ label, value }) => (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">{label}</p>
        <p className="text-gray-900 font-bold">{value}</p>
    </div>
);

const DetailRow = ({ label, value }) => (
    <div className="flex flex-col border-b border-gray-100 pb-2 last:border-0 last:pb-0">
        <span className="text-xs text-gray-500 uppercase font-semibold mb-1">{label}</span>
        <span className="text-gray-900 font-medium">{value}</span>
    </div>
);
