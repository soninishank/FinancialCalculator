import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';

const SPAM_KEYWORDS = ['crypto', 'bitcoin', 'betting', 'casino', 'poker', 'porn', 'lottery', 'viagra'];

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const limit = parseInt(searchParams.get('limit')) || 10;
    const offset = parseInt(searchParams.get('offset')) || 0;

    if (!slug) {
        return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    try {
        const result = await query(
            'SELECT id, name, content, parent_id, created_at FROM comments WHERE calc_slug = $1 AND status = $2 ORDER BY created_at DESC LIMIT $3 OFFSET $4',
            [slug, 'approved', limit, offset]
        );
        return NextResponse.json(result.rows);
    } catch (err) {
        console.error('Error fetching comments:', err);
        return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
    }
}

export async function POST(request) {
    if (!process.env.DATABASE_URL) {
        console.error('[API] POST Fail: DATABASE_URL is missing');
        return NextResponse.json({ error: 'DATABASE_URL is not configured' }, { status: 500 });
    }

    try {
        const body = await request.json();
        const { name, email, content, calc_slug, parent_id, website } = body;

        console.log('[API] New POST request received', {
            slug: calc_slug,
            name: name?.slice(0, 10),
            contentLength: content?.length,
            hasParent: !!parent_id
        });

        // 1. Honeypot check
        if (website) {
            console.warn('[API] SPAM: Honeypot triggered');
            return NextResponse.json({ message: 'Comment submitted (spam detected)' }, { status: 200 });
        }

        // 2. Validation
        if (!name || !email || !content || !calc_slug) {
            console.warn('[API] Validation Fail: Missing fields', { name: !!name, email: !!email, content: !!content, slug: !!calc_slug });
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (name.trim().length < 2 || name.length > 50) {
            console.warn('[API] Validation Fail: Name length', name.length);
            return NextResponse.json({ error: 'Name must be between 2 and 50 characters' }, { status: 400 });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.warn('[API] Validation Fail: Invalid email', email);
            return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
        }

        if (content.trim().length < 10 || content.length > 5000) {
            console.warn('[API] Validation Fail: Content length', content.length);
            return NextResponse.json({ error: 'Comment must be between 10 and 5000 characters' }, { status: 400 });
        }

        // Simple sanitation
        const sanitizedContent = content.replace(/<[^>]*>?/gm, '').trim();
        const sanitizedName = name.replace(/<[^>]*>?/gm, '').trim();

        // 3. Simple Spam Filter
        const lowerContent = content.toLowerCase();
        const isSpam = SPAM_KEYWORDS.some(word => lowerContent.includes(word));
        const status = isSpam ? 'spam' : 'approved';

        if (isSpam) console.warn('[API] Flagged as spam');

        // 4. Rate Limiting
        const ip = request.headers.get('x-forwarded-for') || '0.0.0.0';

        console.log('[API] Database inserting...');
        const result = await query(
            'INSERT INTO comments (name, email, content, calc_slug, parent_id, status, ip_address) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
            [sanitizedName, email, sanitizedContent, calc_slug, parent_id || null, status, ip]
        );

        console.log('[API] Insert success', { id: result.rows[0].id });

        return NextResponse.json({
            id: result.rows[0].id,
            status,
            message: status === 'spam' ? 'Comment flagged for review' : 'Comment posted successfully'
        });
    } catch (err) {
        console.error('[API] POST Catch-all error:', err);
        const url = process.env.DATABASE_URL || '';
        return NextResponse.json({
            error: 'Failed to post comment',
            details: err.message,
            urlPreview: {
                length: url.length,
                prefix: url.substring(0, 15),
                isBase: url === 'base'
            },
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        }, { status: 500 });
    }
}
