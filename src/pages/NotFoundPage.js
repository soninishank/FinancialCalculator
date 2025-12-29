
import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/home/Header';

export default function NotFoundPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <main className="flex-grow flex items-center justify-center px-4 py-20">
                <div className="max-w-md w-full text-center">
                    <div className="mb-8">
                        <span className="text-9xl font-extrabold text-teal-100 block">404</span>
                        <h1 className="text-3xl font-bold text-gray-900 -mt-8 relative z-10">Page Not Found</h1>
                    </div>
                    <p className="text-gray-600 mb-8 text-lg">
                        Oops! The page you are looking for might have been moved, deleted, or possibly never existed.
                    </p>
                    <div className="space-y-4">
                        <Link
                            to="/calculators"
                            className="block w-full px-6 py-3 bg-teal-600 text-white font-semibold rounded-xl shadow hover:bg-teal-700 transition"
                        >
                            Explore Calculators
                        </Link>
                        <Link
                            to="/"
                            className="block w-full px-6 py-3 bg-white text-teal-600 font-semibold rounded-xl border border-gray-200 hover:border-teal-100 hover:bg-teal-50 transition"
                        >
                            Back to Home
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
