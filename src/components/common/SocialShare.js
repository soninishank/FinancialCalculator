import React from 'react';
import { Share2, Twitter, Linkedin, MessageCircle, Link as LinkIcon } from 'lucide-react';

const SocialShare = ({ title, url }) => {
    const shareUrl = url || window.location.href;
    const shareTitle = title || document.title;

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
        navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
    };

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
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`p-2.5 rounded-xl transition-all ${link.color} hover:shadow-sm`}
                        title={`Share on ${link.name}`}
                    >
                        <link.icon size={20} />
                    </a>
                ))}
                <button
                    onClick={copyToClipboard}
                    className="p-2.5 rounded-xl transition-all text-indigo-600 bg-indigo-50 hover:bg-indigo-100 hover:shadow-sm"
                    title="Copy Link"
                >
                    <LinkIcon size={20} />
                </button>
            </div>
        </div>
    );
};

export default SocialShare;
