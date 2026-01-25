import { siteConfig } from '../config/site';

export default function robots() {
    return {
        rules: [
            {
                userAgent: '*',
                // By default, everything is allowed unless explicitly disallowed
                // We only need to specify what should NOT be crawled
                disallow: ['/admin/', '/api/'],
            },
        ],
        sitemap: `${siteConfig.url}/sitemap.xml`,
    };
}
