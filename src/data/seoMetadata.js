// src/data/seoMetadata.js
export const calculatorFaqs = {
    'pure-sip': [
        {
            q: "What is a SIP (Systematic Investment Plan) and how does it actually work?",
            a: "A Systematic Investment Plan (SIP) is a disciplined investment approach that allows you to invest a fixed sum of money at regular intervals (usually monthly) into a mutual fund scheme. Instead of trying to 'time the market,' you benefit from Rupee Cost Averaging. When prices are low, your fixed investment buys more units, and when prices are high, it buys fewer. Over the long term, this typically results in a lower average cost per unit and helps in disciplined wealth creation by leveraging the power of compounding."
        },
        {
            q: "How does Rupee Cost Averaging benefit a long-term SIP investor?",
            a: "Rupee Cost Averaging is a core advantage of SIP. In a volatile market, the NAV (Net Asset Value) of a fund fluctuates. By investing a fixed amount every month, you automatically buy more units when the NAV is low (market dip) and fewer units when the NAV is high (market peak). This eliminates the emotional stress of predicting market movements. For a long-term investor, this 'averaging' effect often leads to better returns compared to a poorly timed lumpsum investment, as it smoothens out the overall purchase price over the investment horizon."
        },
        {
            q: "What is the difference between a Growth SIP and a Dividend (IDCW) SIP?",
            a: "In a 'Growth' option, any profits made by the fund are reinvested back into the scheme, leading to an increase in the NAV over time. This is ideal for long-term wealth creation as it maximizes the power of compounding. In contrast, the 'IDCW' (Income Distribution cum Capital Withdrawal) option may distribute portions of the profit to investors as dividends. However, these dividends are not guaranteed and are now taxable in the hands of the investor, which might reduce the overall compounding effect compared to the Growth option."
        },
        {
            q: "Can I increase or decrease my SIP amount after the investment has started?",
            a: "Yes, SIPs are highly flexible. Most modern platforms allow you to 'Top-Up' or 'Step-Up' your existing SIP annually or at specific intervals. If you face a financial crunch, you can also 'Pause' your SIP for a few months or reduce the amount (subject to the fund's minimum requirement). This flexibility ensures that your investment plan can adapt to changes in your income levels or financial requirements without needing to close the entire folio."
        }
    ],
    'lump-sum': [
        {
            q: "When is the most opportunistic time to make a lumpsum investment?",
            a: "The ideal time for a lumpsum investment is typically during a market correction or when valuations are attractive (low Price-to-Earnings ratios). Unlike SIP, which averages costs, a lumpsum investment's performance is highly dependent on the entry point. Professional investors often look for 'market bottoms' following major economic news or sectoral pullbacks. However, for those with a very long time horizon (10+ years), staying invested is usually more important than perfectly timing the entry, as the power of compounding eventually outweighs minor entry-point fluctuations."
        },
        {
            q: "How should I manage the risk of investing a large lumpsum amount?",
            a: "If you are worried about immediate market volatility after a large lumpsum, you can use a 'Systematic Transfer Plan' (STP). You invest the entire amount in a low-risk Liquid or Debt fund and then schedule regular transfers into an Equity fund over 6 to 12 months. This strategy gives you the best of both worlds: your large capital starts earning modest interest immediately in the debt fund, while you effectively 'SIP' into the equity market to mitigate the risk of a sudden market crash right after your investment."
        },
        {
            q: "What are the tax implications for lumpsum equity mutual fund withdrawals?",
            a: "Lumpsum investments in equity funds held for more than 12 months are subject to Long-Term Capital Gains (LTCG) tax. Currently, LTCG up to ₹1.25 Lakhs per financial year is exempt, and any gains above this are taxed at 12.5%. If you withdraw within 12 months, the gains are considered Short-Term Capital Gains (STCG) and are taxed at 20%. It is important to plan your withdrawals strategically to stay within the exempt limit where possible."
        },
        {
            q: "Is a lumpsum investment better than a SIP for retirement planning?",
            a: "The choice depends on your cash flow. If you receive a large windfall (like a bonus, inheritance, or sale of an asset), a lumpsum investment lets that entire capital start growing immediately. However, most people find SIP better as it aligns with their monthly salary. For many, a hybrid approach works best: maintain a regular monthly SIP to build discipline, and supplement it with occasional lumpsum 'top-ups' whenever the market sees a significant dip of 5% or more."
        }
    ],
    'loan-emi': [
        {
            q: "How is the interest portion of my EMI calculated every month?",
            a: "Most loans use the 'Reducing Balance' method. Every month, the interest is calculated based on the outstanding principal amount, not the original loan amount. For example, if you owe ₹10 Lakhs at 10% interest, the first month's interest is roughly ₹8,333. After you pay your EMI, a portion goes toward this interest and the rest reduces your principal. Next month, the interest is calculated on the *new* lower principal. This is why, in the early years of a long-term loan, your EMI consists mostly of interest, and only a small fraction goes toward principal repayment."
        },
        {
            q: "Does a 0.5% difference in interest rate really matter for a long-term loan?",
            a: "Yes, significantly. On a large, long-term loan like a Home Loan for 20 years, even a 0.5% rate hike can increase your total interest outflow by lakhs and potentially extend your tenure by several months or years. It is always advisable to compare different lenders and periodically check if you can transfer your balance to a lower-interest lender (Balance Transfer), as the cumulative savings over two decades can be substantial."
        },
        {
            q: "What are the benefits of making partial prepayments on a home loan?",
            a: "Partial prepayments directly reduce your outstanding principal. Since future interest is calculated on this reduced principal, prepaying even small amounts early in the loan tenure can drastically reduce your total interest burden and shorten your loan tenure. For instance, paying just one extra EMI per year can often reduce a 20-year loan to 15-16 years. Most lenders do not charge prepayment penalties on floating-rate home loans for individual borrowers, making this a highly effective debt-reduction strategy."
        },
        {
            q: "Why does my loan tenure increase when the benchmark interest rate rises?",
            a: "For floating-rate loans, banks usually keep the EMI constant to avoid disrupting the borrower's monthly budget. To compensate for a higher interest rate, the bank increases the 'interest portion' of your existing EMI. This means less money goes toward the principal, slowing down the repayment process. As a result, the number of months required to finish the loan increases. If the rate rise is sharp, you might even see 'negative amortization,' where you need to either increase your EMI or make a lumpsum payment to prevent the tenure from becoming indefinite."
        }
    ],
    'compound-interest': [
        {
            q: "What is the 'Rule of 72' and how does it relate to compounding?",
            a: "The Rule of 72 is a quick, useful formula that estimates how many years it will take for your money to double at a given annual return. You simply divide 72 by your interest rate. For example, at a 12% return, your money doubles in about 6 years (72/12). This rule highlights the exponential nature of compounding; even a small increase in the rate of return can significantly shorten the time required for your wealth to multiply."
        },
        {
            q: "Why is the frequency of compounding (Monthly vs. Yearly) so vital?",
            a: "The more frequently interest is added to your principal, the faster your wealth grows. This is because interest earned in the first month starts earning its own interest in the second month. For instance, a 10% annual rate compounded monthly results in an 'Effective Annual Yield' of 10.47%, whereas yearly compounding stays at 10%. Over long periods (20+ years), this small difference in frequency can lead to a significantly larger final corpus."
        },
        {
            q: "How does inflation impact the 'real' value of my compounded returns?",
            a: "While compounding grows your nominal wealth, inflation erodes your purchasing power. If your investment earns 10% but inflation is 6%, your 'Real Rate of Return' is only about 4%. To truly build wealth, you must ensure that your compounding rate comfortably exceeds the inflation rate. This is why equity is often preferred for long-term goals despite its volatility, as it historically offers a higher margin over inflation compared to traditional savings."
        },
        {
            q: "Why is time considered the most critical factor in the power of compounding?",
            a: "In the compounding formula, 'Time' is the exponent. The growth in the final years of an investment is often greater than the entire growth in the first decade. This 'snowball effect' means that someone who starts investing small amounts at age 25 will often have a much larger retirement fund than someone who starts much larger investments at age 40. Starting early gives your money the 'runway' it needs to reach the vertical part of the growth curve."
        }
    ],
    'swp-calculator': [
        {
            q: "What is the 'Safe Withdrawal Rate' in an SWP strategy?",
            a: "A Safe Withdrawal Rate is the percentage of your portfolio you can withdraw annually without running out of money before you die. While the '4% Rule' is a famous benchmark in the US, in India, you must adjust it based on higher inflation and market volatility. Ideally, if your equity-heavy portfolio earns 12% on average and inflation is 6%, withdrawing 4-6% annually is generally considered safe, as it allows the remaining balance to continue growing and keep up with rising costs."
        },
        {
            q: "Is SWP more tax-efficient than a Dividend payout for retired individuals?",
            a: "Yes, usually. In an SWP, each withdrawal is considered a mix of 'principal' and 'capital gains.' Only the GAIN portion is taxed. If held for over a year, these are Long-Term Capital Gains, which enjoy a ₹1.25 Lakh exemption limit and a lower 12.5% tax rate. In contrast, dividends are taxed fully according to your income tax slab (which could be up to 30%). For those in higher tax brackets, SWP is significantly more efficient for generating monthly income."
        },
        {
            q: "How can 'Sequence of Returns Risk' impact my SWP plan?",
            a: "Sequence of Returns Risk is the danger of a market crash happening early in your retirement when you are just starting withdrawals. If you withdraw ₹50,000 every month while the market is down 20%, you are forced to sell many more units to meet that cash requirement, which can permanently deplete your portfolio. To mitigate this, many advisors suggest keeping 2-3 years of withdrawal amounts in a safe Liquid/Debt fund and only drawing from the Equity fund when markets are performing well."
        },
        {
            q: "Can I use SWP from an ELSS (Tax-Saving) fund?",
            a: "You can only start an SWP from an ELSS fund *after* the mandatory 3-year lock-in period has expired for the respective units. Since SIP units in ELSS have individual lock-in periods, you need to be careful with the timing. Once the units are free, SWP works the same way as any other equity fund, providing a tax-efficient way to utilize your tax-saved corpus for regular needs."
        }
    ],
    'cagr-calculator': [
        {
            q: "Why is CAGR a better performance metric than Average Annual Return?",
            a: "Average annual return can be misleading. If an investment goes up 50% in Year 1 and down 50% in Year 2, the 'average' return is 0%, but you have actually lost 25% of your money. CAGR (Compound Annual Growth Rate) provides a 'smoothed' annual return that accounts for volatility and tells you the true rate at which your investment grew from start to finish. It is the gold standard for comparing the performance of different asset classes over long periods."
        },
        {
            q: "How do I use CAGR to compare a Mutual Fund with a Real Estate investment?",
            a: "CAGR is perfect for 'apples-to-apples' comparisons. For a Mutual Fund, use the entry and exit NAVs and the duration. For Real Estate, calculate the total purchase price (including registration/taxes) and the final sale price (after brokerage/taxes). Duration is the years you held the property. By converting both to a CAGR percentage, you can clearly see which asset actually provided a better return on your capital, regardless of the different timeframes or investment sizes."
        },
        {
            q: "What are the limitations of CAGR when analyzing an investment portfolio?",
            a: "CAGR assumes the growth was steady and uniform every year, which is never the case in real markets. It hides the intermediate volatility (risk). Two funds could have an identical 12% CAGR over 5 years, but one might have been steady while the other had a 40% crash in between. Therefore, while CAGR tells you the 'what' (the final return), you should also look at metrics like Standard Deviation or Sharpe Ratio to understand the 'how' (the risk taken)."
        },
        {
            q: "Is it possible to have a negative CAGR?",
            a: "Yes. If your final investment value is lower than your initial investment, your CAGR will be negative. This indicates that your investment lost value over the period. A -5% CAGR means you lost 5% of your remaining capital every year on average. It is a stark reminder to periodically review underperforming assets and cut losses if the long-term growth story has changed."
        }
    ],
    'xirr-calculator': [
        {
            q: "Why is XIRR the ultimate math tool for SIP and Mutual Fund investors?",
            a: "In a real-world scenario, you don't just invest once; you make multiple deposits (SIPs) and occasional withdrawals at different dates. CAGR only works for a single start and end point. XIRR (Extended Internal Rate of Return) calculates the internal rate of return for a series of cash flows happening at irregular intervals. It treats every SIP installment as its own mini-investment and provides a single annualized percentage that represents your portfolio's true worth."
        },
        {
            q: "How do I accurately calculate XIRR for my personal stock portfolio?",
            a: "To get an accurate XIRR, you must list every 'Cash Outflow' (money you spent to buy stocks) as a negative value with the exact date, and every 'Cash Inflow' (dividends received or stocks sold) as a positive value with its date. Finally, add the current market value of your total holdings as a positive value with today's date. The resulting XIRR percentage is the most genuine reflection of your portfolio's performance, accounting for all buying, selling, and income."
        },
        {
            q: "Why can my XIRR be extremely high or low during the first few months?",
            a: "XIRR 'annualizes' your returns. If you invest ₹10,000 and it becomes ₹11,000 in just one month, that is a 10% absolute gain but a massive ~213% XIRR, because the calculator assumes that growth rate will continue for 12 months. This is why XIRR is often misleading for short-term data (less than 1 year). It is always best to look at XIRR only after you have been invested for at least 18-24 months for a stable and realistic performance figure."
        },
        {
            q: "Does XIRR account for taxes and brokerage fees?",
            a: "Standard XIRR only accounts for the cash flows you input. To see your 'net' performance, you should input the 'net' purchase price (including brokerage/taxes) and the 'net' redemption value (after STCG/LTCG taxes). By doing this, your XIRR will represent the actual 'take-home' growth of your wealth, which is often 1-2% lower than the 'gross' XIRR shown by many apps."
        }
    ],
    'ppf-calculator': [
        {
            q: "Why is the 5th of every month critical for PPF investors?",
            a: "In a Public Provident Fund (PPF), interest is calculated on the minimum balance in your account between the 5th and the end of the month. If you deposit after the 5th, you lose out on interest for that entire month. To maximize your tax-free returns, always ensure your PPF contribution is credited before the 5th of April (for the whole year) or by the 5th of every month (if paying monthly)."
        },
        {
            q: "What is the 'EEE' tax status and why is it so rare?",
            a: "PPF enjoys the rare 'Exempt-Exempt-Exempt' status. This means: 1) Your investment is exempt from tax (under 80C), 2) The interest earned every year is exempt from tax, and 3) The final maturity amount is exempt from tax. Most other investments (like FDs or Mutual Funds) are taxed at either the interest stage or the withdrawal stage. This makes PPF one of the most powerful risk-free debt instruments in an Indian investor's portfolio."
        },
        {
            q: "Can I extend my PPF account beyond the initial 15-year maturity?",
            a: "Yes, you can extend your PPF account indefinitely in blocks of 5 years. You have two options: 'Extension with contribution' (where you continue to invest and earn tax benefits) or 'Extension without contribution' (where your existing balance continues to earn interest but you don't need to put in more money). You must notify the bank/post office about your choice within one year of the account's maturity to keep it active."
        },
        {
            q: "Is it possible to take a loan against my PPF balance?",
            a: "Yes, you can take a loan from your PPF account from the 3rd to the 6th financial year of opening the account. The loan amount can be up to 25% of the balance at the end of the 2nd preceding year. The interest charged on this loan is typically 1% above the prevailing PPF interest rate. This can be a useful source of low-cost funds for temporary needs without needing to break your long-term investment."
        }
    ],
    'car-loan-emi': [
        {
            q: "How do I decide between a longer tenure and a higher EMI for a car loan?",
            a: "A car is a depreciating asset, so generally, the faster you pay it off, the better. A longer tenure (e.g., 7 years) results in a lower, more comfortable EMI, but you end up paying significantly more in interest over time. A shorter tenure (e.g., 3-4 years) has a higher monthly burden but saves you money and gets you out of debt faster. The best strategy is to choose the shortest tenure where the EMI doesn't exceed 10-15% of your monthly take-home pay."
        },
        {
            q: "What are 'Zero Down Payment' car loans and are they a good idea?",
            a: "Zero down payment loans mean the bank finances 100% of the car's on-road price. While this requires no immediate cash, it is often much more expensive. You will have a higher EMI, and because the loan amount is larger, you pay much more interest over the tenure. Additionally, since cars lose 20% of their value as soon as they leave the showroom, you might find yourself 'underwater' (owing more than the car is worth) for the first few years of the loan."
        },
        {
            q: "How does my Credit Score (CIBIL) affect my car loan interest rate?",
            a: "Most major lenders now use 'Risk-Based Pricing.' If your CIBIL score is high (above 750 or 800), you can qualify for the bank's lowest advertised interest rate. If your score is lower (600-700), the bank might still approve your loan but charge 1-3% higher interest to compensate for the perceived risk. Improving your score before applying can save you thousands of rupees over the life of the loan."
        },
        {
            q: "What is the difference between an 'Ex-Showroom' and 'On-Road' price loan?",
            a: "The 'Ex-Showroom' price is just the cost of the car from the manufacturer. The 'On-Road' price includes Road Tax, Registration, and Insurance. Some banks only finance up to 80-90% of the Ex-Showroom price, meaning you must pay the rest (including taxes and insurance) out of pocket. Others offer On-Road financing. Always clarify which price the bank is using for the 'Loan-to-Value' (LTV) calculation so you can plan your down payment accordingly."
        }
    ],
    'advanced-home-loan': [
        {
            q: "What are the common hidden costs in a home loan beyond the EMI?",
            a: "Beyond the EMI, you must account for: 1) Processing Fees (often 0.25% to 1% of the loan), 2) Technical/Legal Valuation fees, 3) MODT (Memorandum of Deposit of Title Deed) charges, 4) Documentation and Franking charges, and 5) Property Insurance (mandatory for most loans). These can add up to ₹50,000 to ₹2 Lakhs depending on the loan size and should be factored into your upfront budget."
        },
        {
            q: "Should I choose a Fixed or Floating interest rate for my home loan?",
            a: "In India, almost all home loans are now 'Floating,' linked to a benchmark like the Repo Rate (EBLR). This means your rate changes when the RBI changes its policy rates. True 'Fixed' rates are rare and usually much higher (2-3% more). Some banks offer 'Hybrid' rates (fixed for 2-3 years, then floating). For most long-term borrowers, Floating is better as it allows you to benefit from falling interest rate cycles and usually has no prepayment penalties."
        },
        {
            q: "How does a 'Home Loan Overdraft' (or Home Saver) account work?",
            a: "A Home Loan Overdraft account is linked to your home loan. Any surplus money you park in this account is 'deducted' from your outstanding principal when calculating interest. For example, if you have a ₹50 Lakh loan and park ₹5 Lakhs in this account, interest is only charged on ₹45 Lakhs. The key benefit is that this ₹5 Lakhs remains accessible for emergencies, unlike a prepayment where the money is gone. It is a fantastic tool for business owners or those with fluctuating cash flows."
        },
        {
            q: "What are the tax benefits available under Home Loan repayment?",
            a: "You can save tax on two fronts: 1) Principal Repayment: Up to ₹1.5 Lakhs can be claimed under Section 80C (shared with PPF, LIC, etc.). 2) Interest Payment: Up to ₹2 Lakhs can be claimed as a deduction under Section 24(b) for a self-occupied property. If the property is let out, the entire interest can theoretically be set off against rental income, though there are caps on the 'loss from house property' you can carry forward."
        }
    ]
};

export const siteOrganization = {
    "@type": "Organization",
    "name": "Hashmatic",
    "url": "https://www.hashmatic.in",
    "logo": "https://www.hashmatic.in/logo192.png",
    "sameAs": [
        "https://twitter.com/hashmatic",
        "https://facebook.com/hashmatic",
        "https://linkedin.com/company/hashmatic"
    ],
    "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+91-XXXXXXXXXX",
        "contactType": "customer service"
    }
};
