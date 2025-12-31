// src/pages/HomeFrontPage.js
import React from "react";
import Link from "next/link";

// import SEO from "../components/common/SEO";

// ... imports

export default function HomeFrontPage() {

  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Hashmatic",
    "url": "https://www.hashmatic.in",
    "applicationCategory": "FinanceApplication"
  };

  return (
    <>
      {/* SEO handled in page.js metadata */}

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
              href="/calculators"
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



