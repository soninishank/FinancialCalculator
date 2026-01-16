import React, { useState } from "react";
import Link from 'next/link';
import { useTheme } from '../../contexts/ThemeContext';
import { ArrowLeft, ArrowRight, DollarSign, Calculator, LineChart, TrendingUp, RefreshCw, Briefcase, ExternalLink } from "lucide-react";

// Questions to guide the user (Step-based)
const QUESTIONS = [
    {
        id: "goal",
        question: "What is your primary financial goal right now?",
        options: [
            { text: "Grow Wealth / Invest", next: "investment_type", icon: TrendingUp },
            { text: "Plan a Loan / Buy Asset", next: "loan_type", icon: Briefcase },
            { text: "Retirement / Freedom", next: "fire_goal", icon: RefreshCw },
        ],
    },
    {
        id: "investment_type",
        question: "How do you want to invest?",
        options: [
            { text: "Systematic (Monthly)", valid: ["sip-plus-lump", "step-up-sip"], icon: RefreshCw },
            { text: "Lump Sum (One-time)", valid: ["lump-sum", "cagr-calculator"], icon: DollarSign },
            { text: "Safe Returns (FD/RD/PPF)", valid: ["fixed-deposit", "recurring-deposit", "ppf-calculator"], icon: Briefcase },
        ],
    },
    {
        id: "loan_type",
        question: "What kind of loan or liability?",
        options: [
            { text: "Home Loan", valid: ["loan-emi", "home-loan-eligibility"], icon: Briefcase },
            { text: "Car Loan", valid: ["car-loan-emi"], icon: Briefcase },
            { text: "Compare Loans", valid: ["compare-loans"], icon: LineChart },
            { text: "Pay off Credit Card", valid: ["credit-card-payoff"], icon: DollarSign },
        ],
    },
    {
        id: "fire_goal",
        question: "Thinking about financial independence?",
        options: [
            { text: "When can I retire?", valid: ["ultimate-fire-planner"], icon: TrendingUp },
            { text: "How long will money last?", valid: ["swr-simulator"], icon: LineChart },
            { text: "Cost of Delaying Investment", valid: ["cost-of-delay"], icon: Calculator },
        ],
    },
];

const RECOMMENDED_METADATA = {
    "sip-plus-lump": { title: "SIP Calculator", desc: "Calculate returns on monthly investments." },
    "step-up-sip": { title: "Step-Up SIP", desc: "Increase SIP annually to reach goals faster." },
    "lump-sum": { title: "Lump Sum Calculator", desc: "One-time investment growth calculator." },
    "cagr-calculator": { title: "CAGR Calculator", desc: "Calculate compound annual growth rate." },
    "fixed-deposit": { title: "FD Calculator", desc: "Fixed Deposit maturity & interest." },
    "recurring-deposit": { title: "RD Calculator", desc: "Recurring Deposit maturity & interest." },
    "ppf-calculator": { title: "PPF Calculator", desc: "Public Provident Fund returns." },
    "loan-emi": { title: "Home Loan EMI", desc: "Calculate EMI & Amortization." },
    "home-loan-eligibility": { title: "Start Eligibility Check", desc: "How much loan can you get?" },
    "car-loan-emi": { title: "Car Loan EMI", desc: "Plan your car purchase." },
    "compare-loans": { title: "Compare Loans", desc: "Check which loan is cheaper." },
    "credit-card-payoff": { title: "Card Payoff", desc: "Plan to be debt-free." },
    "ultimate-fire-planner": { title: "FIRE Planner", desc: "Financial Independence & Retire Early." },
    "swr-simulator": { title: "Wealth Runway", desc: "How long will your corpus last?" },
    "cost-of-delay": { title: "Cost of Delay", desc: "See the price of waiting to invest." },
};

export default function CalculatorAdvisor() {
    const { isDarkMode } = useTheme();
    const [history, setHistory] = useState(["goal"]); // stack of question IDs
    const [answers, setAnswers] = useState({}); // map of questionId -> selectedOption
    const [resultSlugs, setResultSlugs] = useState(null);

    const currentQId = history[history.length - 1];
    const currentQ = QUESTIONS.find((q) => q.id === currentQId);

    const handleOptionClick = (option) => {
        // Save answer
        setAnswers({ ...answers, [currentQId]: option });

        if (option.valid) {
            // Reached a result
            setResultSlugs(option.valid);
        } else if (option.next) {
            // Go to next question
            setHistory([...history, option.next]);
        }
    };

    const handleReset = () => {
        setHistory(["goal"]);
        setAnswers({});
        setResultSlugs(null);
    };

    const handleBack = () => {
        if (history.length > 1) {
            const newHist = [...history];
            newHist.pop();
            setHistory(newHist);
            setResultSlugs(null);
        }
    };

    // Render Result
    if (resultSlugs) {
        return (
            <div className={`rounded-2xl p-8 border shadow-sm transition-all duration-500 transform translate-y-0 opacity-100 animate-in fade-in slide-in-from-bottom-2 ${isDarkMode
                ? 'bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800'
                : 'bg-gradient-to-br from-indigo-50 to-white border-indigo-100'
                }`}>
                <div className="text-center mb-8">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 ${isDarkMode ? 'bg-teal-500/10 text-teal-400' : 'bg-teal-100 text-teal-600'
                        }`}>
                        <Calculator size={24} />
                    </div>
                    <h3 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>We Recommend</h3>
                    <p className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>Based on your goal, these tools fit best:</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 max-w-2xl mx-auto">
                    {resultSlugs.map((slug) => {
                        const meta = RECOMMENDED_METADATA[slug] || { title: slug, desc: "" };
                        return (
                            <Link
                                key={slug}
                                href={`/calculators/${slug}`}
                                className={`group p-4 rounded-xl border transition-all text-left flex items-start gap-4 ${isDarkMode
                                    ? 'bg-slate-900/50 border-slate-800 hover:border-teal-500/50 hover:bg-slate-800/50'
                                    : 'bg-white border-gray-200 hover:border-teal-500 hover:shadow-md'
                                    }`}
                            >
                                <div className={`p-2 rounded-lg transition-colors ${isDarkMode
                                    ? 'bg-slate-800 text-slate-500 group-hover:bg-teal-500/10 group-hover:text-teal-400'
                                    : 'bg-gray-50 text-gray-400 group-hover:bg-teal-50 group-hover:text-teal-600'
                                    }`}>
                                    <ExternalLink size={18} />
                                </div>
                                <div>
                                    <div className={`font-bold transition-colors ${isDarkMode ? 'text-slate-200 group-hover:text-teal-400' : 'text-gray-900 group-hover:text-teal-700'
                                        }`}>
                                        {meta.title}
                                    </div>
                                    <div className={`text-xs mt-1 ${isDarkMode ? 'text-slate-500' : 'text-gray-500'}`}>{meta.desc}</div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                <div className="mt-8 text-center">
                    <button
                        onClick={handleReset}
                        className={`text-sm font-semibold flex items-center justify-center gap-2 mx-auto py-2 px-4 rounded-lg transition-colors ${isDarkMode
                            ? 'text-slate-500 hover:text-teal-400 hover:bg-slate-800'
                            : 'text-gray-500 hover:text-indigo-600 hover:bg-gray-100'
                            }`}
                    >
                        <RefreshCw size={14} /> Start Over
                    </button>
                </div>
            </div>
        );
    }

    // Render Question
    return (
        <div className={`rounded-2xl p-8 border shadow-sm relative overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'
            }`}>
            {/* Progress / Decoration */}
            <div className={`absolute top-0 left-0 w-full h-1 ${isDarkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
                <div
                    className="h-full bg-teal-500 transition-all duration-300"
                    style={{ width: `${(history.length / 3) * 100}%` }}
                ></div>
            </div>

            <div className="max-w-xl mx-auto text-center">
                <h3 className={`text-xl md:text-2xl font-bold mb-8 leading-tight ${isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                    {currentQ?.question}
                </h3>

                <div className="grid gap-4">
                    {currentQ?.options.map((opt, idx) => {
                        const Icon = opt.icon || ArrowRight;
                        return (
                            <button
                                key={idx}
                                onClick={() => handleOptionClick(opt)}
                                className={`group relative flex items-center justify-between w-full p-4 md:p-5 text-left border-2 rounded-xl transition-all duration-200 ${isDarkMode
                                    ? 'border-slate-800 hover:border-teal-500/50 hover:bg-teal-500/5'
                                    : 'border-gray-100 hover:border-teal-500 hover:bg-teal-50/30'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isDarkMode
                                        ? 'bg-slate-800 text-slate-500 group-hover:bg-slate-700 group-hover:text-teal-400'
                                        : 'bg-gray-100 text-gray-500 group-hover:bg-white group-hover:text-teal-600'
                                        }`}>
                                        <Icon size={20} />
                                    </div>
                                    <span className={`font-semibold text-lg transition-colors ${isDarkMode ? 'text-slate-300 group-hover:text-white' : 'text-gray-700 group-hover:text-teal-900'
                                        }`}>
                                        {opt.text}
                                    </span>
                                </div>
                                <ArrowRight className={`transform group-hover:translate-x-1 transition-all ${isDarkMode ? 'text-slate-600 group-hover:text-teal-500' : 'text-gray-300 group-hover:text-teal-500'
                                    }`} size={20} />
                            </button>
                        );
                    })}
                </div>

                {history.length > 1 && (
                    <div className={`mt-8 pt-6 border-t ${isDarkMode ? 'border-slate-800' : 'border-gray-50'}`}>
                        <button
                            onClick={handleBack}
                            className={`text-sm font-medium flex items-center justify-center gap-2 mx-auto transition-colors ${isDarkMode ? 'text-slate-500 hover:text-slate-300' : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            <ArrowLeft size={16} /> Back
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
