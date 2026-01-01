'use client';

import React from 'react';

const COLORS = [
    'bg-blue-500', 'bg-teal-500', 'bg-indigo-500', 'bg-purple-500',
    'bg-pink-500', 'bg-orange-500', 'bg-rose-500', 'bg-cyan-500'
];

function getAvatarColor(name) {
    const charCode = name.charCodeAt(0);
    return COLORS[charCode % COLORS.length];
}

function CommentItem({ comment, replies, onReply }) {
    const avatarColor = getAvatarColor(comment.name);
    const initials = comment.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    return (
        <div className="mb-8 last:mb-0">
            <div className="flex gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0 shadow-sm ${avatarColor}`}>
                    {initials}
                </div>
                <div className="flex-1">
                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 shadow-sm transition-hover hover:border-teal-100">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="font-bold text-gray-900">{comment.name}</h4>
                            <span className="text-xs text-gray-400">
                                {new Date(comment.created_at).toLocaleDateString(undefined, {
                                    year: 'numeric', month: 'long', day: 'numeric'
                                })}
                            </span>
                        </div>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                        <button
                            onClick={() => onReply(comment.id)}
                            className="mt-3 text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors"
                        >
                            Reply
                        </button>
                    </div>

                    {replies.length > 0 && (
                        <div className="ml-6 mt-6 border-l-2 border-gray-100 pl-6">
                            {replies.map(reply => (
                                <CommentItem
                                    key={reply.id}
                                    comment={reply}
                                    replies={[]} // Limit to 1 level deep for simplicity in UI
                                    onReply={onReply}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function CommentList({ comments, onReply }) {
    if (comments.length === 0) {
        return (
            <div className="py-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 mt-12">
                <p className="text-gray-500 italic">No comments yet. Be the first to share your thoughts!</p>
            </div>
        );
    }

    // Organize nested comments
    const rootComments = comments.filter(c => !c.parent_id);
    const getReplies = (id) => comments.filter(c => c.parent_id === id);

    return (
        <div className="mt-12 space-y-12">
            <h3 className="text-xl font-bold text-gray-900 mb-8 border-b border-gray-100 pb-4">
                {comments.length} Response{comments.length !== 1 ? 's' : ''}
            </h3>
            <div className="space-y-8">
                {rootComments.map(comment => (
                    <CommentItem
                        key={comment.id}
                        comment={comment}
                        replies={getReplies(comment.id)}
                        onReply={onReply}
                    />
                ))}
            </div>
        </div>
    );
}
