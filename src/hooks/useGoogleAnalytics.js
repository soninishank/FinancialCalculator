'use client';

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const GA_MEASUREMENT_ID = 'G-N9ZGWK9DNG';

export const useGoogleAnalytics = () => {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (!GA_MEASUREMENT_ID || typeof window === 'undefined') return;

        // 1. Load the script if not already loaded
        const scriptId = "ga-script";
        if (!document.getElementById(scriptId)) {
            const script = document.createElement("script");
            script.id = scriptId;
            script.async = true;
            script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
            document.head.appendChild(script);

            // Initialize dataLayer
            window.dataLayer = window.dataLayer || [];
            function gtag() { window.dataLayer.push(arguments); }
            gtag('js', new Date());
            gtag('config', GA_MEASUREMENT_ID, {
                send_page_view: false // We will send it manually to handle SPA routes
            });
            window.gtag = gtag;
        }
    }, []);

    useEffect(() => {
        if (!GA_MEASUREMENT_ID || !window.gtag || typeof window === 'undefined') return;

        // 2. Send pageview on route change
        window.gtag("config", GA_MEASUREMENT_ID, {
            page_path: pathname + searchParams.toString(),
        });
    }, [pathname, searchParams]);
};
