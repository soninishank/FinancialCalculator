
import React, { useEffect } from 'react';

export default function SEO({ title, description, keywords, schema, path, image }) {
    const fullTitle = title ? `${title} - Hashmatic` : 'Hashmatic - Financial Tools';
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
    const defaultImage = "https://placehold.co/1200x630/teal/white?text=Hashmatic";

    // Update Title
    useEffect(() => {
        document.title = fullTitle;
    }, [fullTitle]);

    // Update Meta Tags
    useEffect(() => {
        const updateTag = (selector, attribute, value) => {
            let element = document.querySelector(selector);
            if (!element) {
                element = document.createElement('meta');
                if (selector.startsWith('meta[name=')) {
                    element.setAttribute('name', selector.replace('meta[name="', '').replace('"]', ''));
                } else if (selector.startsWith('meta[property=')) {
                    element.setAttribute('property', selector.replace('meta[property="', '').replace('"]', ''));
                }
                document.head.appendChild(element);
            }
            element.setAttribute(attribute, value);
        };

        // Standard SEO
        if (description) updateTag('meta[name="description"]', 'content', description);
        if (keywords) updateTag('meta[name="keywords"]', 'content', Array.isArray(keywords) ? keywords.join(', ') : keywords);

        // Open Graph
        updateTag('meta[property="og:title"]', 'content', fullTitle);
        updateTag('meta[property="og:description"]', 'content', description || '');
        updateTag('meta[property="og:url"]', 'content', currentUrl);
        updateTag('meta[property="og:type"]', 'content', 'website');
        updateTag('meta[property="og:image"]', 'content', image || defaultImage);

        // Twitter Card
        updateTag('meta[name="twitter:card"]', 'content', 'summary_large_image');
        updateTag('meta[name="twitter:title"]', 'content', fullTitle);
        updateTag('meta[name="twitter:description"]', 'content', description || '');
        updateTag('meta[name="twitter:image"]', 'content', image || defaultImage);

        // Canonical
        let link = document.querySelector('link[rel="canonical"]');
        if (!link) {
            link = document.createElement('link');
            link.setAttribute('rel', 'canonical');
            document.head.appendChild(link);
        }
        link.setAttribute('href', currentUrl);

    }, [fullTitle, description, keywords, currentUrl, image]);

    // Inject JSON-LD Schema
    useEffect(() => {
        if (!schema) return;

        let script = document.querySelector('script[type="application/ld+json"]');
        if (!script) {
            script = document.createElement('script');
            script.setAttribute('type', 'application/ld+json');
            document.head.appendChild(script);
        }
        script.textContent = JSON.stringify(schema);
    }, [schema]);

    return null;
}
