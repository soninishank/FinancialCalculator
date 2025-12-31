import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumbs = ({ items }) => {
    return (
        <nav className="flex mb-6" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-2">
                <li className="inline-flex items-center">
                    <Link
                        href="/"
                        className="inline-flex items-center text-xs font-medium text-gray-500 hover:text-teal-600 transition-colors"
                    >
                        <Home className="w-3 h-3 mr-1" />
                        Home
                    </Link>
                </li>
                {items.map((item, index) => (
                    <li key={index}>
                        <div className="flex items-center">
                            <ChevronRight className="w-3 h-3 text-gray-400 mx-1" />
                            {item.href ? (
                                <Link
                                    href={item.href}
                                    className="text-xs font-medium text-gray-500 hover:text-teal-600 transition-colors"
                                >
                                    {item.label}
                                </Link>
                            ) : (
                                <span className="text-xs font-medium text-gray-400 cursor-default">
                                    {item.label}
                                </span>
                            )}
                        </div>
                    </li>
                ))}
            </ol>
        </nav>
    );
};

export default Breadcrumbs;
