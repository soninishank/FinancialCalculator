// src/hooks/useIpoData.js
import { useState, useEffect, useMemo } from 'react';
import rawIpoData from "../../data/IPOData.json"; // Your initial local data


const determineStatus = (openDate, closeDate, listingDate) => {
    const now = new Date();
    const list = new Date(listingDate);
    const close = new Date(closeDate);
    const open = new Date(openDate);

    if (list < now) return 'Closed';
    if (close < now) return 'Closed'; // Subscribed/Allotment phase
    if (open <= now && close >= now) return 'Open';
    return 'Upcoming';
};

export function useIpoData() {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error] = useState(null);

    useEffect(() => {
        // --- FUTURE AUTOMATION POINT ---
        // This is where you will replace this with a secure API call:
        // fetch('/api/v1/live-ipo-data').then(res => res.json()).then(setData)
        
        // Simulating data fetch and processing
        const processed = rawIpoData.map(ipo => ({
            ...ipo,
            status: determineStatus(ipo.openDate, ipo.closeDate, ipo.listingDate),
            // Utility for easy sorting/filtering later
            openDateMS: new Date(ipo.openDate).getTime(),
            closeDateMS: new Date(ipo.closeDate).getTime(),
            listingDateMS: new Date(ipo.listingDate).getTime(),
        }));

        // Simulating network delay
        setTimeout(() => {
            setData(processed);
            setIsLoading(false);
        }, 500); 

    }, []); // Empty array runs only once on mount

    const categorizedData = useMemo(() => {
        return {
            Upcoming: data.filter(ipo => ipo.status === 'Upcoming'),
            Open: data.filter(ipo => ipo.status === 'Open'),
            Closed: data.filter(ipo => ipo.status === 'Closed'),
        };
    }, [data]);

    return { data, categorizedData, isLoading, error };
}