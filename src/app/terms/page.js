export const metadata = {
    title: 'Terms of Service | FinCalc',
    description: 'Terms of service for using FinCalc financial calculators and tools.',
};

export default function TermsOfService() {
    return (
        <div className="max-w-4xl mx-auto px-6 py-12">
            <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-8 tracking-tight">
                Terms of <span className="text-indigo-600">Service</span>
            </h1>

            <div className="prose prose-slate dark:prose-invert max-w-none space-y-8 text-slate-600 dark:text-slate-400">
                <section>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">1. Acceptance of Terms</h2>
                    <p>
                        By accessing and using FinCalc, you agree to comply with and be bound by these Terms of Service. If you do not agree, please do not use our services.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">2. Description of Service</h2>
                    <p>
                        FinCalc provides various financial calculators and informational tools for educational and illustrative purposes. We do not provide financial, investment, or legal advice.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">3. Disclaimer of Warranties</h2>
                    <p>
                        Our tools are provided "as is" without warranties of any kind. While we strive for high precision, we do not guarantee the accuracy, completeness, or reliability of any results or content. Always consult a professional financial advisor for actual financial planning.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">4. Limitation of Liability</h2>
                    <p>
                        FinCalc and its creators shall not be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use our tools.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">5. User Conduct</h2>
                    <p>
                        You agree to use the site for lawful purposes and not to engage in any activity that interferes with the site's operation or security.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">6. Changes to Terms</h2>
                    <p>
                        We reserve the right to modify these terms at any time. Your continued use of the site following changes constitutes acceptance of the new terms.
                    </p>
                </section>

                <p className="text-sm font-bold text-slate-400 mt-12">
                    Last Updated: January 15, 2026
                </p>
            </div>
        </div>
    );
}
