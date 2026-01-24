import { siteConfig } from '../config/site';

export default function robots() {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/admin/', '/api/', '/_next/'],
            },
        ],
        sitemap: `${siteConfig.url}/sitemap.xml`,
    };
}
