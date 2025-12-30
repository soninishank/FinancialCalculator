import React from 'react';
import { Link } from 'react-router-dom';
import manifest from '../../utils/calculatorsManifest';

const Footer = () => {
    // Group calculators by category for the footer
    const categories = manifest.reduce((acc, calc) => {
        const cat = calc.category || 'General';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(calc);
        return acc;
    }, {});

    return (
        <footer className="bg-white border-t border-gray-100 py-10">
            <div className="max-w-[1920px] mx-auto px-4 sm:px-6 md:px-8">
                <div className="columns-2 md:columns-3 lg:columns-5 gap-8">
                    {/* Brand Section */}
                    <div className="break-inside-avoid mb-8 space-y-3">
                        <Link to="/" className="text-xl font-black text-teal-600 tracking-tighter">
                            HASHMATIC
                        </Link>
                        <p className="text-gray-500 text-xs leading-relaxed max-w-xs">
                            Free, precise, and beautifully designed financial tools.
                        </p>
                    </div>

                    {/* Dynamic Links from Manifest */}
                    {Object.entries(categories).map(([category, items]) => (
                        <div key={category} className="break-inside-avoid mb-8">
                            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-3">{category}</h3>
                            <ul className="space-y-1.5">
                                {items.map(calc => (
                                    <li key={calc.slug}>
                                        <Link
                                            to={`/calculators/${calc.slug}`}
                                            className="text-gray-500 hover:text-teal-600 text-xs transition-colors block"
                                        >
                                            {calc.title}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom Bar */}
                <div className="pt-6 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
                    <p>© {new Date().getFullYear()} Hashmatic. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link to="/calculators" className="hover:text-teal-600 transition-colors">All Calculators</Link>
                        <a href="https://github.com/soninishank" target="_blank" rel="noopener noreferrer" className="hover:text-teal-600 transition-colors">Github</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
