'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import { Share2, Twitter, Linkedin, MessageCircle, Link as LinkIcon } from 'lucide-react';

const SocialShare = ({ title, url }) => {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const [shareUrl, setShareUrl] = useState(url || '');
    const [shareTitle, setShareTitle] = useState(title || '');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Priority: provided url prop > current window URL
            if (url) {
                setShareUrl(url);
            } else {
                setShareUrl(window.location.href);
            }
            if (!title) setShareTitle(document.title);
        }
    }, [url, title, searchParams, pathname]);

    // If we are on server and don't have URL, we might render buttons with empty links or placeholder
    // Ideally we want links to work if possible.
    // But for "current page" behavior, we need client side.

    const shareLinks = [
        {
            name: 'Twitter',
            icon: Twitter,
            href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`,
            color: 'text-sky-500 bg-sky-50 hover:bg-sky-100'
        },
        {
            name: 'LinkedIn',
            icon: Linkedin,
            href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
            color: 'text-blue-700 bg-blue-50 hover:bg-blue-100'
        },
        {
            name: 'WhatsApp',
            icon: MessageCircle,
            href: `https://wa.me/?text=${encodeURIComponent(shareTitle + ' ' + shareUrl)}`,
            color: 'text-green-600 bg-green-50 hover:bg-green-100'
        }
    ];

    const copyToClipboard = () => {
        if (!shareUrl) return;
        navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
    };

    if (!shareUrl && !url) {
        // Render nothing or shell until mounted? 
        // Better to render with empty links than crash.
        // Or return null to avoid hydration mismatch if possible?
        // Let's render but with '#' or similar if empty.
        // Actually, preventing rendering until we have URL is cleaner for UI.
    }

    return (
        <div className="flex flex-col space-y-4 mt-8 pt-8 border-t border-gray-100">
            <div className="flex items-center gap-2 text-gray-500 text-sm font-semibold uppercase tracking-wider">
                <Share2 size={16} />
                <span>Share this calculator</span>
            </div>
            <div className="flex items-center gap-4">
                {shareLinks.map((link) => (
                    <a
                        key={link.name}
                        href={shareUrl ? link.href : '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`p-2.5 rounded-xl transition-all ${link.color} hover:shadow-sm ${!shareUrl ? 'pointer-events-none opacity-50' : ''}`}
                        title={`Share on ${link.name}`}
                        onClick={(e) => {
                            if (!shareUrl) e.preventDefault();
                        }}
                    >
                        <link.icon size={20} />
                    </a>
                ))}
                <button
                    onClick={copyToClipboard}
                    className={`p-2.5 rounded-xl transition-all text-indigo-600 bg-indigo-50 hover:bg-indigo-100 hover:shadow-sm ${!shareUrl ? 'pointer-events-none opacity-50' : ''}`}
                    title="Copy Link"
                >
                    <LinkIcon size={20} />
                </button>
            </div>
        </div>
    );
};

export default SocialShare;
