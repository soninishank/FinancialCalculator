import { NextResponse } from 'next/server';
import axios from 'axios';
import https from 'https';
import { query } from '../../../lib/db';
import { enrichClustersWithAI } from '../../../lib/gemini';

// Auto-create table on first run
let tableInitialized = false;

// Source authority tiers (higher = more authoritative)
const SOURCE_TIERS = {
    // Finance
    'WSJ Markets': 3, 'NYT Business': 3, 'Bloomberg Markets': 3, 'Financial Times': 3,
    'Forbes Business': 2, 'CNBC': 2, 'MarketWatch': 2, 'Yahoo Finance': 2,
    'Seeking Alpha': 1, 'The Motley Fool': 1, 'ETF Trends': 1,
    'CoinDesk': 1, 'CoinTelegraph': 1, 'The Block': 1, 'CryptoSlate': 1,

    // Tech
    'TechCrunch': 3, 'The Verge': 3, 'Wired': 3, 'Ars Technica': 2, 'Engadget': 2, 'Hacker News': 2,

    // Sports
    'ESPN': 3, 'BBC Sport': 3, 'The Athletic': 3, 'Bleacher Report': 2,

    // Science
    'Science Daily': 2, 'Nature': 3, 'Scientific American': 3, 'Space.com': 2,

    // Entertainment
    'Variety': 3, 'Hollywood Reporter': 3, 'Entertainment Weekly': 2, 'IGN': 2,

    // World
    'BBC News': 3, 'Reuters': 3, 'Associated Press': 3, 'The Guardian': 3, 'Al Jazeera': 2,

    // Reddit
    'r/investing': 1, 'r/personalfinance': 1, 'r/technology': 1, 'r/programming': 1,
    'r/sports': 1, 'r/science': 1, 'r/space': 1, 'r/entertainment': 1, 'r/gaming': 1, 'r/worldnews': 1
};

const FEEDS = [
    // Finance
    { name: 'WSJ Markets', url: 'https://feeds.a.dj.com/rss/RSSMarketsMain.xml', category: 'Finance' },
    { name: 'NYT Business', url: 'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml', category: 'Finance' },
    { name: 'Bloomberg Markets', url: 'https://feeds.bloomberg.com/markets/news.rss', category: 'Finance' },
    { name: 'Yahoo Finance', url: 'https://finance.yahoo.com/news/rssindex', category: 'Finance' },
    { name: 'CNBC', url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10000664', category: 'Finance' },
    { name: 'MarketWatch', url: 'http://feeds.marketwatch.com/marketwatch/topstories/', category: 'Finance' },
    { name: 'Seeking Alpha', url: 'https://seekingalpha.com/feed.xml', category: 'Finance' },
    { name: 'Forbes Business', url: 'https://www.forbes.com/business/feed/', category: 'Finance' },
    { name: 'Financial Times', url: 'https://www.ft.com/rss/home', category: 'Finance' },
    { name: 'The Motley Fool', url: 'https://www.fool.com/feeds/index.aspx?id=foolwatch', category: 'Finance' },
    { name: 'ETF Trends', url: 'https://www.etftrends.com/feed/', category: 'Finance' },
    { name: 'CoinDesk', url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', category: 'Finance' },
    { name: 'CoinTelegraph', url: 'https://cointelegraph.com/rss', category: 'Finance' },
    { name: 'The Block', url: 'https://www.theblock.co/rss.xml', category: 'Finance' },
    { name: 'CryptoSlate', url: 'https://cryptoslate.com/feed/', category: 'Finance' },

    // Technology
    { name: 'TechCrunch', url: 'https://techcrunch.com/feed/', category: 'Technology' },
    { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', category: 'Technology' },
    { name: 'Wired', url: 'https://www.wired.com/feed/rss', category: 'Technology' },
    { name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/index', category: 'Technology' },
    { name: 'Engadget', url: 'https://www.engadget.com/rss.xml', category: 'Technology' },
    { name: 'Hacker News', url: 'https://hnrss.org/frontpage', category: 'Technology' },

    // Sports
    { name: 'ESPN', url: 'https://www.espn.com/espn/rss/news', category: 'Sports' },
    { name: 'BBC Sport', url: 'https://feeds.bbci.co.uk/sport/rss.xml', category: 'Sports' },
    { name: 'The Athletic', url: 'https://theathletic.com/feed/', category: 'Sports' },
    { name: 'Bleacher Report', url: 'https://bleacherreport.com/articles.rss', category: 'Sports' },

    // Science
    { name: 'Science Daily', url: 'https://www.sciencedaily.com/rss/all.xml', category: 'Science' },
    { name: 'Nature', url: 'https://www.nature.com/nature.rss', category: 'Science' },
    { name: 'Scientific American', url: 'https://rss.sciam.com/ScientificAmerican-News', category: 'Science' },
    { name: 'Space.com', url: 'https://www.space.com/feeds/all', category: 'Science' },

    // Entertainment
    { name: 'Variety', url: 'https://variety.com/feed/', category: 'Entertainment' },
    { name: 'Hollywood Reporter', url: 'https://www.hollywoodreporter.com/feed/', category: 'Entertainment' },
    { name: 'Entertainment Weekly', url: 'https://ew.com/feed/', category: 'Entertainment' },
    { name: 'IGN', url: 'https://feeds.ign.com/ign/all', category: 'Entertainment' },

    // World
    { name: 'BBC News', url: 'https://feeds.bbci.co.uk/news/rss.xml', category: 'World' },
    { name: 'Reuters', url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', category: 'World' },
    { name: 'Associated Press', url: 'https://apnews.com/apf-topnews', category: 'World' },
    { name: 'The Guardian', url: 'https://www.theguardian.com/world/rss', category: 'World' },
    { name: 'Al Jazeera', url: 'https://www.aljazeera.com/xml/rss/all.xml', category: 'World' },

    // Reddit
    { name: 'r/investing', url: 'https://www.reddit.com/r/investing/.rss', category: 'Finance' },
    { name: 'r/personalfinance', url: 'https://www.reddit.com/r/personalfinance/.rss', category: 'Finance' },
    { name: 'r/technology', url: 'https://www.reddit.com/r/technology/.rss', category: 'Technology' },
    { name: 'r/programming', url: 'https://www.reddit.com/r/programming/.rss', category: 'Technology' },
    { name: 'r/sports', url: 'https://www.reddit.com/r/sports/.rss', category: 'Sports' },
    { name: 'r/science', url: 'https://www.reddit.com/r/science/.rss', category: 'Science' },
    { name: 'r/space', url: 'https://www.reddit.com/r/space/.rss', category: 'Science' },
    { name: 'r/entertainment', url: 'https://www.reddit.com/r/entertainment/.rss', category: 'Entertainment' },
    { name: 'r/gaming', url: 'https://www.reddit.com/r/gaming/.rss', category: 'Entertainment' },
    { name: 'r/worldnews', url: 'https://www.reddit.com/r/worldnews/.rss', category: 'World' }
];

const POPULAR_KEYWORDS = [
    'elon', 'musk', 'trump', 'donald', 'fed', 'federal reserve', 'interest rate', 'powell',
    'war', 'ukraine', 'gaza', 'israel', 'conflict', 'nato', 'inflation', 'recession',
    'harris', 'biden', 'modi', 'putin', 'china', 'economy', 'budget', 'ipo'
];

function isPopular(story) {
    if (!story || !story.title) return false;
    const content = (story.title + ' ' + (story.description || '')).toLowerCase();
    return POPULAR_KEYWORDS.some(keyword => content.includes(keyword.toLowerCase()));
}

async function parseRSS(url, source, category) {
    try {
        const response = await axios.get(url, {
            timeout: 10000,
            httpsAgent: new https.Agent({ rejectUnauthorized: false }),
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const data = response.data;
        // Support both RSS (<item>) and Atom (<entry>)
        const items = (data.match(/<(?:item|entry)>([\s\S]*?)<\/(?:item|entry)>/g) || []).slice(0, 10);

        return items.map(item => {
            const title = item.match(/<title(?:[^>]*?)>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/)?.[1] || '';

            // Link handling for RSS and Atom
            let link = '';
            if (item.includes('<link>')) {
                link = item.match(/<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/)?.[1] || '';
            } else {
                link = item.match(/<link[^>]*?href=["']([^"']+)["']/)?.[1] || '';
            }

            const pubDate = item.match(/<(?:pubDate|updated|published)>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/(?:pubDate|updated|published)>/)?.[1] || '';
            const description = item.match(/<(?:description|summary|content)(?:[^>]*?)>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/(?:description|summary|content)>/)?.[1] || '';
            const author = item.match(/<(?:dc:creator|author|creator|name)>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/(?:dc:creator|author|creator|name)>/)?.[1] || null;

            // Extract image from various sources (including Reddit thumbnails)
            const mediaContent = item.match(/<(?:media:content|content)[^>]*url=["']([^"']+)["']/)?.[1];
            const mediaThumbnail = item.match(/<(?:media:thumbnail|thumbnail)[^>]*url=["']([^"']+)["']/)?.[1];
            const enclosure = item.match(/<enclosure[^>]*url=["']([^"']+)["']/)?.[1];
            const imgInDesc = description.match(/<img[^>]*src=["']([^"']+)["']/)?.[1];
            const imageUrl = mediaContent || mediaThumbnail || enclosure || imgInDesc || null;

            const cleanDescription = normalizeStoryText(description, null);
            const cleanTitle = normalizeStoryText(title, source);

            return {
                title: cleanTitle,
                link: link.trim(),
                pubDate: pubDate.trim(),
                description: cleanDescription,
                author: author ? normalizeStoryText(author, null) : null,
                imageUrl,
                source,
                category,
                timestamp: new Date(pubDate).getTime() || Date.now()
            };
        }).filter(item => item.title && item.link);
    } catch (error) {
        // Fallback to HTTP if HTTPS fails with TLS/Socket issues
        if (url.startsWith('https://') && (error.message.includes('disconnected') || error.message.includes('TLS') || error.message.includes('ECONNRESET'))) {
            const httpUrl = url.replace('https://', 'http://');
            try {
                const response = await axios.get(httpUrl, {
                    timeout: 8000,
                    headers: { 'User-Agent': 'Mozilla/5.0' }
                });
                // Recurse with HTTP result (manually parse since we have the data)
                console.log(`[News API] Fallback to HTTP successful for ${source}`);
                const data = response.data;
                const items = (data.match(/<(?:item|entry)>([\s\S]*?)<\/(?:item|entry)>/g) || []).slice(0, 10);
                return items.map(item => {
                    const title = item.match(/<title(?:[^>]*?)>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/)?.[1] || '';
                    let link = '';
                    if (item.includes('<link>')) {
                        link = item.match(/<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/)?.[1] || '';
                    } else {
                        link = item.match(/<link[^>]*?href=["']([^"']+)["']/)?.[1] || '';
                    }
                    const pubDate = item.match(/<(?:pubDate|updated|published)>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/(?:pubDate|updated|published)>/)?.[1] || '';
                    const description = item.match(/<(?:description|summary|content)(?:[^>]*?)>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/(?:description|summary|content)>/)?.[1] || '';
                    const author = item.match(/<(?:dc:creator|author|creator|name)>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/(?:dc:creator|author|creator|name)>/)?.[1] || null;
                    const mediaContent = item.match(/<(?:media:content|content)[^>]*url=["']([^"']+)["']/)?.[1];
                    const mediaThumbnail = item.match(/<(?:media:thumbnail|thumbnail)[^>]*url=["']([^"']+)["']/)?.[1];
                    const enclosure = item.match(/<enclosure[^>]*url=["']([^"']+)["']/)?.[1];
                    const imgInDesc = description.match(/<img[^>]*src=["']([^"']+)["']/)?.[1];
                    const imageUrl = mediaContent || mediaThumbnail || enclosure || imgInDesc || null;

                    return {
                        title: normalizeStoryText(title, source),
                        link: link.trim(),
                        pubDate: pubDate.trim(),
                        description: normalizeStoryText(description, null),
                        author: author ? normalizeStoryText(author, null) : null,
                        imageUrl,
                        source,
                        category,
                        timestamp: new Date(pubDate).getTime() || Date.now()
                    };
                }).filter(item => item.title && item.link);
            } catch (hError) {
                console.error(`Error fetching feed from ${source} (HTTP fallback failed):`, hError.message);
            }
        }
        console.error(`Error fetching feed from ${source}:`, error.message);
        return [];
    }
}

function decodeEntities(encodedString) {
    if (!encodedString) return '';
    return encodedString
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))
        .replace(/&#x([0-9a-f]+);/gi, (match, hex) => String.fromCharCode(parseInt(hex, 16)))
        .replace(/&ldquo;/g, '"')
        .replace(/&rdquo;/g, '"')
        .replace(/&lsquo;/g, "'")
        .replace(/&rsquo;/g, "'")
        .replace(/&ndash;/g, '-')
        .replace(/&mdash;/g, '—')
        .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
        .trim();
}

function normalizeStoryText(text, source) {
    if (!text) return '';
    let cleaned = decodeEntities(text);

    // Remove HTML tags aggressively
    cleaned = cleaned.replace(/<[^>]*>/g, '');

    // Remove specific source suffixes often found in headlines (e.g., "- Reuters", "| CNBC")
    if (source) {
        const sourcePattern = new RegExp(`[\\-|\\|\\s\\(]+${source}.*?$`, 'i');
        cleaned = cleaned.replace(sourcePattern, '');
    }

    // Clean up excessive whitespace and special characters
    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    // Reddit specific cleanup
    if (cleaned.includes('submitted by')) {
        cleaned = cleaned.split('submitted by')[0].trim();
    }

    return cleaned
        .replace(/\[link\]|\[comments\]/g, '')
        .replace(/view comments.*?$/i, '')
        .trim();
}

// Extract key entities and topics from title
function extractEntities(title) {
    const entities = [];
    const titleLower = title.toLowerCase();

    // Extract company names (capitalized words, common stock tickers)
    const companyPattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g;
    const companies = title.match(companyPattern) || [];
    entities.push(...companies.filter(c => c.length > 2));

    // Extract topics
    const topics = [];
    if (/(bitcoin|crypto|blockchain|ethereum|btc|eth|binance|coinbase)/i.test(titleLower)) topics.push('Cryptocurrency');
    if (/(ai|artificial intelligence|chatgpt|openai|machine learning|nvidia|claude|gemini)/i.test(titleLower)) topics.push('AI & Tech');
    if (/(stock|market|trading|s&p|dow|nasdaq|wall street|inflation|fed|interest rate)/i.test(titleLower)) topics.push('Markets');
    if (/(regulation|sec|fda|government|policy|law|court|congress|legislation)/i.test(titleLower)) topics.push('Regulation');
    if (/(earnings|revenue|profit|quarter|q[1-4]|dividend|growth)/i.test(titleLower)) topics.push('Earnings');
    if (/(iphone|apple|samsung|pixel|gadget|hardware|startup|venture capital|tech acquisition)/i.test(titleLower)) topics.push('Tech News');
    if (/(nfl|nba|soccer|premier league|champions league|olympics|cricket|tennis|golf|f1|formula 1)/i.test(titleLower)) topics.push('Sports');
    if (/(space|nasa|spacex|climate|health|research|discovery|astronomy|physics|biology)/i.test(titleLower)) topics.push('Science');
    if (/(movie|film|tv|series|actor|actress|music|album|artist|gaming|ps5|xbox|nintendo|celebrity)/i.test(titleLower)) topics.push('Entertainment');
    if (/(election|politics|conflict|war|diplomacy|international|summit|un|nato)/i.test(titleLower)) topics.push('Politics & World');

    return { entities, topics: [...new Set(topics)] };
}

// Calculate similarity score between two stories
function calculateSimilarity(story1, story2) {
    const title1 = story1.title.toLowerCase();
    const title2 = story2.title.toLowerCase();

    // Extract entities
    const entities1 = extractEntities(story1.title).entities.map(e => e.toLowerCase());
    const entities2 = extractEntities(story2.title).entities.map(e => e.toLowerCase());

    // Entity overlap score
    const entityOverlap = entities1.filter(e => entities2.includes(e)).length;

    // Keyword overlap (Jaccard similarity)
    const words1 = new Set(title1.split(/\s+/).filter(w => w.length > 3));
    const words2 = new Set(title2.split(/\s+/).filter(w => w.length > 3));
    const intersection = new Set([...words1].filter(w => words2.has(w)));
    const union = new Set([...words1, ...words2]);
    const jaccardScore = union.size > 0 ? intersection.size / union.size : 0;

    // Combined score
    return entityOverlap * 0.6 + jaccardScore * 0.4;
}

// Cluster stories by similarity
function clusterStories(stories) {
    const clusters = [];
    const processed = new Set();

    // Sort by timestamp (newest first) and source authority
    stories.sort((a, b) => {
        const timeDiff = b.timestamp - a.timestamp;
        if (Math.abs(timeDiff) < 3600000) { // Within 1 hour, use authority
            return (SOURCE_TIERS[b.source] || 0) - (SOURCE_TIERS[a.source] || 0);
        }
        return timeDiff;
    });

    for (let i = 0; i < stories.length; i++) {
        if (processed.has(i)) continue;

        const mainStory = stories[i];
        const cluster = {
            main: mainStory,
            related: [],
            category: mainStory.category,
            tags: extractEntities(mainStory.title).topics
        };
        processed.add(i);

        // Track sources we've already added to this cluster
        const seenSources = new Set([mainStory.source]);

        // Find related stories
        for (let j = i + 1; j < stories.length; j++) {
            if (processed.has(j)) continue;

            const otherStory = stories[j];

            // Skip if we already have an article from this source in this cluster
            if (seenSources.has(otherStory.source)) {
                continue;
            }

            const similarity = calculateSimilarity(mainStory, otherStory);

            // Extract topics for both stories
            const mainTopics = extractEntities(mainStory.title).topics;
            const otherTopics = extractEntities(otherStory.title).topics;

            // Check if stories share at least one topic tag
            const hasTopicOverlap = mainTopics.length > 0 && otherTopics.length > 0 &&
                mainTopics.some(topic => otherTopics.includes(topic));

            // Cluster if:
            // They are in the SAME category AND have enough similarity + topic overlap
            const sameCategory = mainStory.category === otherStory.category;

            if (sameCategory && similarity > 0.4 && hasTopicOverlap) {
                cluster.related.push(otherStory);
                seenSources.add(otherStory.source);
                processed.add(j);
            }
        }

        clusters.push(cluster);
    }

    return clusters;
}

// Rank clusters by importance
function rankClusters(clusters) {
    return clusters.map(cluster => {
        // Recency score (0-1, decays over 24 hours)
        const ageHours = (Date.now() - cluster.main.timestamp) / (1000 * 60 * 60);
        const recencyScore = Math.max(0, 1 - (ageHours / 24));

        // Authority score (0-1)
        const authorityScore = (SOURCE_TIERS[cluster.main.source] || 1) / 3;

        // Cluster size bonus (more sources = more important)
        const clusterBonus = Math.min(0.3, cluster.related.length * 0.05);

        // Popularity bonus (Boost major events)
        const popularityBonus = isPopular(cluster.main) ? 0.3 : 0;

        // Combined importance score
        const importance = (recencyScore * 0.4) + (authorityScore * 0.3) + clusterBonus + popularityBonus + 0.1;

        return { ...cluster, importance };
    }).sort((a, b) => b.importance - a.importance);
}

// Initialize database table
async function initializeTable() {
    if (tableInitialized) return;

    try {
        await query(`
            BEGIN;
            CREATE TABLE IF NOT EXISTS news_cache (
                id SERIAL PRIMARY KEY,
                cache_key VARCHAR(100) UNIQUE NOT NULL,
                category VARCHAR(50) DEFAULT 'All',
                data JSONB NOT NULL,
                created_at TIMESTAMP DEFAULT NOW(),
                expires_at TIMESTAMP NOT NULL
            );
            
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='news_cache' AND column_name='category') THEN
                    ALTER TABLE news_cache ADD COLUMN category VARCHAR(50) DEFAULT 'All';
                END IF;
            END $$;

            CREATE INDEX IF NOT EXISTS idx_news_cache_key ON news_cache(cache_key);
            CREATE INDEX IF NOT EXISTS idx_news_cache_category ON news_cache(category);
            CREATE INDEX IF NOT EXISTS idx_news_cache_expires ON news_cache(expires_at);
            COMMIT;
        `);

        tableInitialized = true;
        console.log('[News API] Database table initialized');
    } catch (error) {
        console.error('[News API] Table initialization error:', error);
    }
}

// Get cached data from database
async function getCachedNews(category = 'All', includeStale = false) {
    try {
        const cacheKey = `news-${category.toLowerCase()}`;
        const sql = includeStale
            ? `SELECT data FROM news_cache WHERE cache_key = $1`
            : `SELECT data FROM news_cache WHERE cache_key = $1 AND expires_at > NOW()`;

        const result = await query(sql, [cacheKey]);

        if (result.rows.length > 0) {
            const data = result.rows[0].data;
            if (data && data.clusters && data.clusters.length > 0) {
                if (!includeStale) console.log(`[News API] Cache hit from database (${data.clusters.length} clusters)`);
                return data;
            }
        }

        if (!includeStale) console.log('[News API] Cache miss');
        return null;
    } catch (error) {
        console.error('[News API] Error reading cache:', error);
        return null;
    }
}

// Save data to database cache
async function setCachedNews(category, data) {
    try {
        const cacheKey = `news-${category.toLowerCase()}`;
        await query(
            `INSERT INTO news_cache (cache_key, category, data, expires_at)
             VALUES ($1, $2, $3, NOW() + INTERVAL '45 minutes')
             ON CONFLICT (cache_key) 
             DO UPDATE SET data = $3, expires_at = NOW() + INTERVAL '45 minutes', created_at = NOW()`,
            [cacheKey, category, JSON.stringify(data)]
        );

        console.log(`[News API] Cache saved for category: ${category}`);

        // Cleanup expired entries and entries older than 1 month
        const cleanupResult = await query(
            `DELETE FROM news_cache 
             WHERE expires_at < NOW() OR created_at < NOW() - INTERVAL '1 month'`
        );

        if (cleanupResult.rowCount > 0) {
            console.log(`[News API] Cleaned up ${cleanupResult.rowCount} old cache entries`);
        }
    } catch (error) {
        console.error('[News API] Error saving cache:', error);
    }
}

// Background warmup for all categories
async function warmupAllCategories(excludeCategory) {
    const categories = ['All', 'Finance', 'Technology', 'Sports', 'Science', 'Entertainment', 'World'];
    console.log(`[News API] Background warmup started (excluding: ${excludeCategory})`);

    for (const cat of categories) {
        if (cat === excludeCategory) continue;

        try {
            // Check if valid cache already exists
            const cached = await getCachedNews(cat, false);
            if (cached) {
                console.log(`[News API] Warmup: ${cat} is already cached`);
                continue;
            }

            console.log(`[News API] Warmup: Processing ${cat}...`);
            const filteredFeeds = cat === 'All' ? FEEDS : FEEDS.filter(f => f.category === cat);
            const results = await Promise.all(filteredFeeds.map(f => parseRSS(f.url, f.name, f.category)));
            const freshStories = results.flat();

            const clustered = clusterStories(freshStories);
            const ranked = rankClusters(clustered);

            // Enrich with AI in the background warmup
            const enriched = await enrichClustersWithAI(ranked.slice(0, 60));

            const response = {
                clusters: enriched,
                lastUpdated: new Date().toISOString()
            };

            await setCachedNews(cat, response);
            console.log(`[News API] Warmup: ${cat} completed`);
        } catch (error) {
            console.error(`[News API] Warmup error for ${cat}:`, error.message);
        }

        // Minor delay to avoid hammering
        await new Promise(r => setTimeout(r, 1000));
    }
}

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || 'All';

    // Initialize table on first run
    await initializeTable();

    // Check database cache (non-stale)
    const cachedData = await getCachedNews(category, false);
    if (cachedData) {
        // Trigger background warmup for other categories if this is a primary request
        if (category === 'All') {
            warmupAllCategories('All').catch(console.error);
        }
        return NextResponse.json(cachedData);
    }

    try {
        // Filter feeds based on requested category
        const filteredFeeds = category === 'All'
            ? FEEDS
            : FEEDS.filter(f => f.category === category);

        // Fetch fresh news and stashed history in parallel
        const [results, historyData] = await Promise.all([
            Promise.all(filteredFeeds.map(f => parseRSS(f.url, f.name, f.category))),
            getCachedNews(category, true) // Get stale history for persistence
        ]);

        const freshStories = results.flat();
        console.log(`[News API] Fetched ${freshStories.length} stories for category: ${category}`);

        // Extract popular/recent stories from history to persist
        const persistedStories = [];
        if (historyData && historyData.clusters) {
            const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);

            historyData.clusters.forEach(cluster => {
                const story = cluster.main;
                // Persist if it's popular AND less than 24 hours old
                if (isPopular(story) && story.timestamp > oneDayAgo) {
                    persistedStories.push(story);
                    // Also consider related stories if they are distinct sources
                    cluster.related.forEach(rel => {
                        if (rel.timestamp > oneDayAgo) persistedStories.push(rel);
                    });
                }
            });
            if (persistedStories.length > 0) {
                console.log(`[News API] Persisting ${persistedStories.length} stories for category: ${category}`);
            }
        }

        // Merge and Deduplicate
        const mergedStories = [...freshStories];
        const seenLinks = new Set(freshStories.map(s => s.link));

        persistedStories.forEach(story => {
            if (!seenLinks.has(story.link)) {
                mergedStories.push(story);
                seenLinks.add(story.link);
            }
        });

        const clustered = clusterStories(mergedStories);
        const ranked = rankClusters(clustered);

        // Optional: Trigger background AI enrichment if not cached
        // For the immediate GET request, we skip wait to keep it fast, 
        // but the warmup/background will catch it for the next user.
        const response = {
            clusters: ranked.slice(0, 60), // Top 60 clusters only
            lastUpdated: new Date().toISOString()
        };

        // Save to database cache (fast initial response)
        await setCachedNews(category, response);

        // Schedule background AI enrichment so the next user gets the deep tags
        (async () => {
            try {
                const enriched = await enrichClustersWithAI(ranked.slice(0, 60));
                await setCachedNews(category, {
                    clusters: enriched,
                    lastUpdated: new Date().toISOString()
                });
            } catch (err) {
                console.error(`[News API] Background AI enrichment failed for ${category}:`, err.message);
            }
        })();

        return NextResponse.json(response);
    } catch (error) {
        console.error(`[News API] Error for category ${category}:`, error);
        return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
    }
}
