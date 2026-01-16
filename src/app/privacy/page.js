export const metadata = {
    title: 'Privacy Policy | Hashmatic',
    description: 'Privacy policy for Hashmatic financial calculators and tools.',
};

export default function PrivacyPolicy() {
    return (
        <div className="max-w-4xl mx-auto px-6 py-12">
            <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-8 tracking-tight">
                Privacy <span className="text-teal-600">Policy</span>
            </h1>

            <div className="prose prose-slate dark:prose-invert max-w-none space-y-8 text-slate-600 dark:text-slate-400">
                <section>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Introduction</h2>
                    <p>
                        At Hashmatic, we prioritize your privacy. This Privacy Policy outlines how we handle information when you use our financial calculators and services. Our tools are designed to be privacy-first, often processing data entirely within your browser.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Information We Collect</h2>
                    <p>
                        <strong>Usage Data:</strong> We may collect non-personal information about how you interact with our site (e.g., page views, time spent) to improve our tools.
                    </p>
                    <p>
                        <strong>Calculator Data:</strong> Most of our calculators process data locally on your device. We do not store the specific financial values you input into the calculators unless explicitly stated (e.g., when saving a profile or submitting a comment).
                    </p>
                    <p>
                        <strong>Comments:</strong> If you leave a comment, we collect the name and content you provide to display on the site.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Cookies and Tracking</h2>
                    <p>
                        We use minimal cookies for essential site functionality and basic analytics (via Google Analytics) to understand site traffic. You can disable cookies in your browser settings.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Third-Party Services</h2>
                    <p>
                        We use Google Analytics for traffic analysis and Neon/PostgreSQL for database services (e.g., comments). These providers have their own privacy policies.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Your Rights</h2>
                    <p>
                        You have the right to access, update, or delete any personal information we may hold (such as comments you've posted).
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Contact Us</h2>
                    <p>
                        If you have questions about this policy, please contact us through the website feedback channels.
                    </p>
                </section>

                <p className="text-sm font-bold text-slate-400 mt-12">
                    Last Updated: January 15, 2026
                </p>
            </div>
        </div>
    );
}
