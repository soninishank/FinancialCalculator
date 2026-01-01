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
    try {
        const body = await request.json();
        const { name, email, content, calc_slug, parent_id, website } = body;

        // 1. Honeypot check (website field should be empty)
        if (website) {
            console.log('[SPAM] Honeypot triggered');
            return NextResponse.json({ message: 'Comment submitted (spam detected)' }, { status: 200 });
        }

        // 2. Validation
        if (!name || !email || !content || !calc_slug) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (name.trim().length < 2 || name.length > 50) {
            return NextResponse.json({ error: 'Name must be between 2 and 50 characters' }, { status: 400 });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
        }

        if (content.trim().length < 10 || content.length > 5000) {
            return NextResponse.json({ error: 'Comment must be between 10 and 5000 characters' }, { status: 400 });
        }

        // Simple sanitation: strip HTML tags to prevent XSS
        const sanitizedContent = content.replace(/<[^>]*>?/gm, '').trim();
        const sanitizedName = name.replace(/<[^>]*>?/gm, '').trim();

        // 3. Simple Spam Filter
        const lowerContent = content.toLowerCase();
        const isSpam = SPAM_KEYWORDS.some(word => lowerContent.includes(word));
        const status = isSpam ? 'spam' : 'approved';

        // 4. Rate Limiting (Optional - can be done via IP check or Vercel middleware)
        const ip = request.headers.get('x-forwarded-for') || '0.0.0.0';

        const result = await query(
            'INSERT INTO comments (name, email, content, calc_slug, parent_id, status, ip_address) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
            [sanitizedName, email, sanitizedContent, calc_slug, parent_id || null, status, ip]
        );

        return NextResponse.json({
            id: result.rows[0].id,
            status,
            message: status === 'spam' ? 'Comment flagged for review' : 'Comment posted successfully'
        });
    } catch (err) {
        console.error('Error posting comment:', err);
        return NextResponse.json({ error: 'Failed to post comment', details: err.message }, { status: 500 });
    }
}
