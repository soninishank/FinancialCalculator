'use client';

import React, { useState } from 'react';

export default function CommentForm({ slug, parentId, onCommentPosted }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        content: '',
        website: '' // Honeypot field
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [msg, setMsg] = useState({ type: '', text: '' });
    const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = {};
        if (formData.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters.';
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address.';
        }
        if (formData.content.trim().length < 10) {
            newErrors.content = 'Comment must be at least 10 characters.';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        setIsSubmitting(true);
        setMsg({ type: '', text: '' });

        try {
            const res = await fetch('/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    calc_slug: slug,
                    parent_id: parentId
                })
            });

            const data = await res.json();

            if (res.ok) {
                setMsg({ type: 'success', text: data.status === 'spam' ? 'Your comment has been submitted for review.' : 'Comment posted successfully!' });
                setFormData({ name: '', email: '', content: '', website: '' });
                if (data.status === 'approved' && onCommentPosted) {
                    onCommentPosted();
                }
            } else {
                setMsg({ type: 'error', text: data.error || 'Failed to post comment.' });
            }
        } catch (err) {
            setMsg({ type: 'error', text: 'Something went wrong. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="mt-8 border-t border-gray-100 pt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Leave a Reply</h3>
            <p className="text-sm text-gray-500 mb-6">Your email address will not be published. Required fields are marked *</p>

            <form onSubmit={handleSubmit} className="space-y-4" aria-label="Comment form">
                {/* Honeypot field - hidden from users */}
                <div style={{ display: 'none' }} aria-hidden="true">
                    <input
                        type="text"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        tabIndex="-1"
                        autoComplete="off"
                    />
                </div>

                <div>
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">Comment *</label>
                    <textarea
                        id="content"
                        name="content"
                        rows="5"
                        required
                        value={formData.content}
                        onChange={handleChange}
                        maxLength={5000}
                        className={`w-full px-4 py-3 rounded-xl border ${errors.content ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all resize-none shadow-sm`}
                        placeholder="Share your thoughts..."
                    ></textarea>
                    <div className="flex justify-between mt-1">
                        {errors.content ? <p className="text-xs text-red-500">{errors.content}</p> : <div></div>}
                        <p className={`text-xs ${formData.content.length > 4500 ? 'text-orange-500' : 'text-gray-400'}`}>
                            {formData.content.length}/5000
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 rounded-xl border ${errors.name ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all shadow-sm`}
                            placeholder="Your Name"
                        />
                        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 rounded-xl border ${errors.email ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all shadow-sm`}
                            placeholder="email@example.com"
                        />
                        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                    </div>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`px-8 py-3 rounded-xl font-bold text-white transition-all shadow-md ${isSubmitting ? 'bg-gray-400' : 'bg-teal-600 hover:bg-teal-700 hover:shadow-lg active:scale-95'
                            }`}
                    >
                        {isSubmitting ? 'Posting...' : 'Post Comment'}
                    </button>
                </div>

                {msg.text && (
                    <div className={`p-4 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300 ${msg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                        }`}>
                        {msg.text}
                    </div>
                )}
            </form>
        </div>
    );
}
