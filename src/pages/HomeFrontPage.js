// src/pages/HomeFrontPage.js
import React from "react";
import { Link, useLocation } from "react-router-dom";

import HomeIpoSection from "../components/ipo/HomeIpoSection";

import SEO from "../components/common/SEO";

// ... imports

export default function HomeFrontPage() {

  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Hashmatic",
    "url": "https://hashmatic.in",
    "logo": "https://hashmatic.in/logo512.png",
    "sameAs": [
      // Add social profiles here if available
    ]
  };

  return (
    <>
      <SEO
        title="Financial Calculators & Planning Tools"
        description="Free financial calculators for SIP, Loans, EMI, CAGR and Retirement Planning. Plan your financial journey with Hashmatic."
        keywords={['financial calculator', 'sip calculator', 'loan emi calculator', 'cagr calculator', 'hashmatic']}
        schema={schema}
      />

      {/* -------- HERO SECTION -------- */}
      <section className="bg-indigo-600 text-white py-14">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold">
            Smart Tools to Plan Your Financial Journey
          </h1>
          <p className="mt-3 text-indigo-100 text-lg">
            Master your money with Hashmatic's suite of professional calculators.
          </p>

          <div className="mt-6">
            <Link
              to="/calculators"
              className="px-6 py-3 bg-white text-indigo-600 font-semibold rounded-xl shadow hover:bg-gray-100 transition focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              Explore Calculators
            </Link>
          </div>
        </div>
      </section>

      {/* ... existing feature blocks ... */}

      {/* ... existing popular calculators ... */}

      {/* ... existing knowledge hub ... */}

      {/* -------- FOOTER -------- */}
      <footer className="py-6 bg-gray-100 text-center text-sm text-gray-500 border-t">
        © 2025 Hashmatic. Built for investors.
      </footer>
    </>
  );
}


function CalcCard({ title, slug }) {
  const location = useLocation(); // captures current path (e.g., /calculators)

  return (
    <Link
      to={`/calculators/${slug}`}
      state={{ from: location.pathname }}  // <-- send the origin page
      className="p-6 bg-white rounded-xl shadow hover:shadow-md transition"
    >
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-sm text-gray-600 mt-1">Open calculator →</p>
    </Link>
  );
}


function ArticleCard({ title }) {
  return (
    <div className="p-6 bg-white rounded-xl shadow hover:shadow-md transition">
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-sm text-gray-600 mt-1">Read more →</p>
    </div>
  );
}
