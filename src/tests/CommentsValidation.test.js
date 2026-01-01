
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CommentForm from '../components/common/CommentForm';

// Mock fetch
global.fetch = jest.fn();

describe('CommentForm Validation Tests', () => {
    beforeEach(() => {
        fetch.mockClear();
    });

    test('shows validation errors for empty fields on submit', async () => {
        render(<CommentForm slug="test-calc" />);
        const form = screen.getByRole('form');
        fireEvent.submit(form);

        // Should see error messages (use findByText for async state updates)
        expect(await screen.findByText(/Name must be at least 2 characters/i)).toBeInTheDocument();
        expect(await screen.findByText(/Please enter a valid email address/i)).toBeInTheDocument();
        expect(await screen.findByText(/Comment must be at least 10 characters/i)).toBeInTheDocument();

        // Fetch should NOT have been called
        expect(fetch).not.toHaveBeenCalled();
    });

    test('shows error for invalid email', async () => {
        render(<CommentForm slug="test-calc" />);

        const emailInput = screen.getByPlaceholderText(/email@example.com/i);
        fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

        const form = screen.getByRole('form');
        fireEvent.submit(form);

        expect(await screen.findByText(/Please enter a valid email address/i)).toBeInTheDocument();
    });

    test('submits successfully with valid data', async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ id: 1, status: 'approved' })
        });

        render(<CommentForm slug="test-calc" onCommentPosted={jest.fn()} />);

        fireEvent.change(screen.getByPlaceholderText(/Your Name/i), { target: { value: 'John Doe' } });
        fireEvent.change(screen.getByPlaceholderText(/email@example.com/i), { target: { value: 'john@example.com' } });
        fireEvent.change(screen.getByPlaceholderText(/Share your thoughts.../i), { target: { value: 'This is a great calculator! Very helpful.' } });

        const form = screen.getByRole('form');
        fireEvent.submit(form);

        // Validation errors should NOT be present
        expect(screen.queryByText(/Name must be at least 2 characters/i)).not.toBeInTheDocument();

        // Should show "Posting..." state
        expect(screen.getByText(/Posting.../i)).toBeInTheDocument();

        // Wait for success message
        const successMsg = await screen.findByText(/Comment posted successfully!/i);
        expect(successMsg).toBeInTheDocument();
    });
});
