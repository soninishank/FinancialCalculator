'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import CommentForm from './CommentForm';
import CommentList from './CommentList';

const COMMENTS_PER_PAGE = 5;

export default function CommentSection({ slug }) {
    const [comments, setComments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [replyingTo, setReplyingTo] = useState(null);
    const [offset, setOffset] = useState(0);

    const formRef = useRef(null);
    const observerTarget = useRef(null);

    const fetchComments = useCallback(async (currentOffset, append = false) => {
        try {
            if (append) setIsFetchingMore(true);
            else setIsLoading(true);

            const res = await fetch(`/api/comments?slug=${slug}&limit=${COMMENTS_PER_PAGE}&offset=${currentOffset}`);
            if (res.ok) {
                const data = await res.json();
                if (!Array.isArray(data) || data.length < COMMENTS_PER_PAGE) {
                    setHasMore(false);
                } else {
                    setHasMore(true);
                }

                if (Array.isArray(data)) {
                    setComments(prev => append ? [...prev, ...data] : data);
                }
            } else {
                // If API fails (e.g. 500 error), stop trying to load more
                setHasMore(false);
            }
        } catch (err) {
            console.error('Failed to load comments:', err);
            setHasMore(false);
        } finally {
            setIsLoading(false);
            setIsFetchingMore(false);
        }
    }, [slug]);

    // Initial load
    useEffect(() => {
        setOffset(0);
        setComments([]);
        setHasMore(true);
        fetchComments(0, false);
    }, [slug, fetchComments]);

    // Infinite Scroll Observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMore && !isFetchingMore && !isLoading) {
                    const nextOffset = offset + COMMENTS_PER_PAGE;
                    setOffset(nextOffset);
                    fetchComments(nextOffset, true);
                }
            },
            { threshold: 1.0 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => observer.disconnect();
    }, [hasMore, isFetchingMore, isLoading, offset, fetchComments]);

    const handleReply = (id) => {
        setReplyingTo(id);
        formRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleCommentPosted = () => {
        // Refresh the list from the beginning
        setOffset(0);
        setHasMore(true);
        fetchComments(0, false);
        setReplyingTo(null);
    };

    return (
        <section id="comments" className="mt-16 pb-8">
            {/* 1. Leave a Reply Form (Now at the Top) */}
            <div ref={formRef} className="transition-all">
                {replyingTo && (
                    <div className="bg-teal-50 text-teal-700 px-4 py-3 rounded-xl mb-4 flex justify-between items-center border border-teal-100">
                        <span className="text-sm font-medium italic">
                            Replying to {comments.find(c => c.id === replyingTo)?.name}'s comment
                        </span>
                        <button
                            onClick={() => setReplyingTo(null)}
                            className="text-xs font-bold uppercase tracking-wider hover:text-teal-900"
                        >
                            Cancel
                        </button>
                    </div>
                )}
                <CommentForm
                    slug={slug}
                    parentId={replyingTo}
                    onCommentPosted={handleCommentPosted}
                />
            </div>

            {/* 2. Comments List */}
            <CommentList
                comments={comments}
                onReply={handleReply}
            />

            {/* Loading States & Intersection Trigger */}
            {isLoading ? (
                <div className="mt-12 animate-pulse space-y-4">
                    <div className="h-6 bg-gray-100 rounded w-1/4"></div>
                    <div className="h-32 bg-gray-100 rounded"></div>
                </div>
            ) : (
                <div ref={observerTarget} className="h-10 w-full flex items-center justify-center mt-8">
                    {isFetchingMore && (
                        <div className="flex items-center gap-2 text-teal-600 font-medium">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-600"></div>
                            <span>Loading more comments...</span>
                        </div>
                    )}
                    {!hasMore && comments.length > 0 && (
                        <p className="text-gray-400 text-sm italic">You've reached the end of the comments.</p>
                    )}
                </div>
            )}
        </section>
    );
}
