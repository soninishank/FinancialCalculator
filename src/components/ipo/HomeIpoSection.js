// src/components/ipo/HomeIpoSection.js
import React from "react";
import IpoStatusTabs from "./IPOStatusTabs";
import IpoListTable from "./IPOListTable";
import { useIpoData } from "../../hooks/useIpoData";


export default function HomeIpoSection() {
  // use live data from your local scraper
  const { data, isLoading, error, lastUpdated } = useIpoData({ live: true });
  const [activeTab, setActiveTab] = React.useState("Upcoming");
  const tabs = ["Upcoming", "Open", "Closed"];

  // helper to classify using open/close dates
  const rowsByStatus = React.useMemo(() => {
    const now = Date.now();
    const upcoming = [];
    const open = [];
    const closed = [];
    data.forEach((ipo) => {
      const openMs = ipo.openDate ? new Date(ipo.openDate).getTime() : null;
      const closeMs = ipo.closeDate ? new Date(ipo.closeDate).getTime() : null;
      if (openMs && closeMs) {
        if (openMs <= now && closeMs >= now) open.push(ipo);
        else if (closeMs < now) closed.push(ipo);
        else upcoming.push(ipo);
      } else {
        upcoming.push(ipo);
      }
    });
    return { Upcoming: upcoming, Open: open, Closed: closed };
  }, [data]);

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
        <IpoListTable data={rowsByStatus[activeTab] || []} status={activeTab} />
      )}
    </section>
  );
}
