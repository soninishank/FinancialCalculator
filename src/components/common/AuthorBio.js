
import React from 'react';
import { User, Linkedin, Twitter } from 'lucide-react';

const AuthorBio = () => {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mt-8 mb-8">
            <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative shrink-0">
                    <div className="w-20 h-20 rounded-full bg-teal-100 flex items-center justify-center border-2 border-white shadow-md">
                        <span className="text-2xl font-bold text-teal-700">HT</span>
                    </div>
                    <div className="absolute bottom-0 right-0 bg-green-500 w-5 h-5 rounded-full border-2 border-white" title="Verified Expert"></div>
                </div>

                <div className="text-center sm:text-left flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                        Review by Hashmatic Team
                    </h3>
                    <p className="text-teal-600 text-sm font-semibold mb-3 uppercase tracking-wide">
                        Financial Research Group
                    </p>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                        The Hashmatic Team consists of passionate developers and financial enthusiasts dedicated to simplifying complex financial decisions. We ensure every calculator is rigorously tested for mathematical accuracy and real-world relevance.
                    </p>

                    <div className="flex items-center justify-center sm:justify-start gap-3">
                        <a
                            href="https://twitter.com/hashmatic"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-400 hover:text-teal-500 hover:bg-teal-50 rounded-full transition-colors"
                            aria-label="Twitter Profile"
                        >
                            <Twitter size={18} />
                        </a>
                        <a
                            href="https://linkedin.com/company/hashmatic"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-400 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-colors"
                            aria-label="LinkedIn Profile"
                        >
                            <Linkedin size={18} />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthorBio;
