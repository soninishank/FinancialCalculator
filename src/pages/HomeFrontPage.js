// src/pages/HomeFrontPage.js
import React from "react";
import { Link, useLocation } from "react-router-dom";

import HomeIpoSection from "../components/ipo/HomeIpoSection";


export default function HomeFrontPage() {
  return (
    <>

      {/* -------- HERO SECTION -------- */}
      <section className="bg-indigo-600 text-white py-14">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold">
            Smart Tools to Plan Your Financial Journey
          </h1>
          <p className="mt-3 text-indigo-100 text-lg">
            Mutual funds, IPOs, calculators, demat accounts & more — all in one platform.
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



      {/* -------- FEATURE BLOCKS -------- */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-xl font-semibold mb-6">Explore Our Tools</h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Mutual Funds */}
          {/* <Link to="/mutual-funds" className="p-6 bg-white rounded-xl shadow hover:shadow-md transition">
            <h3 className="font-semibold text-lg mb-2">Mutual Funds</h3>
            <p className="text-sm text-gray-600">
              Compare funds, SIP returns, and top performers.
            </p>
          </Link> */}

          {/* IPOs */}
          {/* <Link to="/ipo-tracker" className="p-6 bg-white rounded-xl shadow hover:shadow-md transition">
            <h3 className="font-semibold text-lg mb-2">IPOs</h3>
            <p className="text-sm text-gray-600">
              Upcoming IPOs, GMP, allotment status & more.
            </p>
          </Link> */}

          {/* Demat Accounts */}
          {/* <Link to="/demat" className="p-6 bg-white rounded-xl shadow hover:shadow-md transition">
            <h3 className="font-semibold text-lg mb-2">Demat Accounts</h3>
            <p className="text-sm text-gray-600">
              Compare brokers, charges & features.
            </p>
          </Link> */}

          {/* Calculators */}
          <Link to="/calculators" className="p-6 bg-white rounded-xl shadow hover:shadow-md transition">
            <h3 className="font-semibold text-lg mb-2">Calculators</h3>
            <p className="text-sm text-gray-600">
              SIP, Loan EMI, CAGR and 10+ financial calculators.
            </p>
          </Link>
        </div>
      </section>

      {/* -------- IPOs (homepage) -------- */}
      {/* <HomeIpoSection /> */}

      {/* -------- FEATURED CALCULATORS -------- */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-xl font-semibold mb-4">Popular Calculators</h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <CalcCard title="SIP Calculator" slug="pure-sip" />
          <CalcCard title="Lump Sum Calculator" slug="lump-sum" />
          <CalcCard title="Compound Interest" slug="compound-interest" />
          <CalcCard title="SIP + Lump Sum" slug="sip-plus-lump" />
          <CalcCard title="Loan EMI Calculator" slug="loan-emi" />
          <CalcCard title="CAGR Calculator" slug="cagr-calculator" />
        </div>

        <div className="text-center mt-6">
          <Link to="/calculators" className="text-indigo-600 font-semibold hover:underline">
            View all calculators →
          </Link>
        </div>
      </section>

      {/* -------- KNOWLEDGE HUB -------- */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-xl font-semibold mb-4">Learn & Grow</h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <ArticleCard title="What is SIP?" />
          <ArticleCard title="How to Choose a Mutual Fund" />
          <ArticleCard title="How Does CAGR Work?" />
        </div>

        <div className="text-center mt-6">
          <Link to="/articles" className="text-indigo-600 font-semibold hover:underline">
            View all articles →
          </Link>
        </div>
      </section>

      {/* -------- FOOTER -------- */}
      <footer className="py-6 bg-gray-100 text-center text-sm text-gray-500 border-t">
        © 2025 Finance Planner. Built for investors.
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
