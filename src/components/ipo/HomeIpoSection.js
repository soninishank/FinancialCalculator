// src/components/ipo/HomeIpoSection.js
import React from "react";
import IpoStatusTabs from "./IPOStatusTabs";
import IpoListTable from "./IPOListTable";
import { useIpoData } from "../../hooks/useIpoData";


export default function HomeIpoSection() {
  // use live data from your local scraper
  // use live data from your local scraper
  const { categorizedData, isLoading, error, lastUpdated } = useIpoData({ live: true });
  const [activeTab, setActiveTab] = React.useState("Upcoming");
  const tabs = ["Upcoming", "Open", "Closed"];

  // use categorizedData directly, defaulting to empty arrays if undefined
  const currentData = categorizedData ? categorizedData[activeTab] : [];

  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-2xl font-semibold">All IPOs</h2>
          <p className="text-sm text-gray-500">Upcoming, open and recently closed IPOs</p>
        </div>

        <div className="text-sm text-gray-500">
          {lastUpdated ? <>Last updated: {new Date(lastUpdated).toLocaleString()}</> : "Live (no timestamp)"}
        </div>
      </div>

      <IpoStatusTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

      {isLoading ? (
        <div className="p-8 bg-white rounded-xl shadow text-center">Loading IPOs…</div>
      ) : error ? (
        <div className="p-6 bg-white rounded-xl shadow text-center text-rose-600">
          Failed to load IPOs. Showing cached / seed data.
        </div>
      ) : (
        <IpoListTable data={currentData || []} status={activeTab} />
      )}
    </section>
  );
}
