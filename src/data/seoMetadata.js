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
    'time-duration-calculator': [
        {
            q: "Does this calculator account for inflation?",
            a: "This specific calculator focuses on the nominal growth of your money—i.e., the actual number on your bank statement. It does not adjust for inflation. If you want to know how long it takes to reach a target in 'today's purchasing power', you should subtract the inflation rate from your expected return rate (e.g., use 6% instead of 12% if inflation is 6%)."
        },
        {
            q: "Why is the time duration result sometimes in decimals?",
            a: "Mathematical compounding is continuous. A result of '5.5 Years' means exactly 5 years and 6 months. Our calculator converts the decimal portion into months for easier reading."
        },
        {
            q: "What if I add monthly contributions (SIP) as well?",
            a: "This calculator is designed strictly for a one-time Lump Sum investment. If you are adding monthly contributions, the math becomes more complex. Please use our 'SIP + Lump Sum Calculator' or 'Goal Planner' to handle scenarios with regular ongoing investments."
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
    ],
    'step-up-sip': [
        {
            q: "What is the ideal percentage for a Step-up SIP?",
            a: "Most financial advisors recommend a 5% to 10% annual increase, as it usually aligns with average salary hikes and inflation."
        },
        {
            q: "Can I cap my Step-up SIP after a few years?",
            a: "Yes, you can specify a 'Maximum Amount' for your SIP. Once reached, the SIP continues at that fixed amount until the end of the tenure."
        },
        {
            q: "Is Step-up better than a One-time Lumpsum?",
            a: "Step-up SIP is generally better for salaried individuals as it builds discipline and reduces the risk of investing a large sum at a market peak."
        }
    ],
    'recurring-deposit': [
        {
            q: "What is the minimum tenure for a Recurring Deposit?",
            a: "Most banks offer RDs starting from 6 months up to 10 years."
        },
        {
            q: "Is the interest earned on RD taxable?",
            a: "Yes, interest earned on RD is fully taxable as per your income tax slab. Banks also deduct TDS (Tax Deducted at Source) if the interest exceeds ₹40,000 (₹50,000 for senior citizens) in a financial year."
        },
        {
            q: "Can I withdraw money from RD before maturity?",
            a: "Yes, premature withdrawal is possible, but banks usually charge a penalty of 0.5% to 1% on the applicable interest rate."
        }
    ],
    'fixed-deposit': [
        {
            q: "What is the difference between Cumulative and Non-cumulative FD?",
            a: "In a Cumulative FD, interest is reinvested and paid at maturity, benefiting from compounding. In a Non-cumulative FD, interest is paid out periodically (monthly/quarterly) to provide regular income."
        },
        {
            q: "Is FD interest taxable?",
            a: "Yes, interest earned on FD is added to your total income and taxed as per your tax slab. Banks also deduct TDS (typically 10%) if interest exceeds ₹40,000 in a year."
        },
        {
            q: "What is a Tax-Saving FD?",
            a: "It is a special type of FD with a mandatory 5-year lock-in period that offers tax deductions under Section 80C of the Income Tax Act."
        }
    ],
    'time-to-goal': [
        { q: "How does inflation affect my time to goal?", a: "Inflation reduces the purchasing power of your money. If your goal requires ₹10 Lakhs today, you might need ₹15 Lakhs in 10 years. Accounting for inflation helps you set a more realistic target." }
    ],
    'sip-plus-lump': [
        { q: "Can I do both SIP and Lump Sum in the same fund?", a: "Yes, most mutual funds allow you to start a SIP and also make additional purchase transactions (lumpsum top-ups) in the same folio." }
    ],
    'advanced-car-loan-emi': [
        { q: "What is a 'balloon payment' in car loans?", a: "A balloon payment is a large lump sum payment due at the end of the loan term. It reduces your monthly EMI but requires you to have a significant amount of cash ready at the end." }
    ],
    'step-up-loan-emi': [
        { q: "How much should I increase my EMI by each year?", a: "A common rule of thumb is to increase your EMI in proportion to your annual salary increment, typically 5-10%." }
    ],
    'moratorium-loan-emi': [
        { q: "Is a loan moratorium 'interest-free'?", a: "No. Interest continues to accrue on the outstanding balance during the moratorium period, and is added to the principal, increasing your loan burden." }
    ],
    'compare-loans': [
        { q: "What is the APR?", a: "APR (Annual Percentage Rate) includes the interest rate plus other costs like processing fees, giving you a true picture of the loan's cost." }
    ],
    'ultimate-fire-planner': [
        { q: "What is the 4% rule?", a: "The 4% rule suggests you can withdraw 4% of your portfolio in the first year of retirement and adjust for inflation thereafter without running out of money for 30 years." }
    ],
    'target-amount-calculator': [
        { q: "How do I decide my target amount?", a: "Consider the future cost of your goal, adjusted for inflation. For example, higher education that costs ₹20L today might cost ₹40L in 10 years." }
    ],
    'rent-vs-buy': [
        { q: "What is the '5% Rule' for Rent vs Buy?", a: "The 5% rule suggests that unrecoverable costs of owning (taxes, maintenance, cost of capital) are roughly 5% of the property value. If annual rent is less than 5% of the property price, renting might be cheaper." }
    ],
    'step-up-plus-lump': [
        { q: "Is this strategy aggressive?", a: "It can be. Combining initial exposure with increasing contributions maximizes equity exposure, which is great for long-term growth but volatile in the short term." }
    ],
    'swr-simulator': [
        { q: "Why simulate sequence of returns?", a: "Average returns don't matter if the market crashes right after you retire. Simulation helps check if your portfolio survives 'bad luck' timing." }
    ],
    'cost-of-delay': [
        { q: "Is it too late to start investing?", a: "It's never too late, but the later you start, the more you need to save to reach the same goal due to less time for compounding." }
    ],
    'step-down-withdrawal': [
        { q: "Why step-down withdrawals?", a: "Many retirees spend more in early active years (travel) and less in later years. This model matches that reality better than flat withdrawals." }
    ],
    'inflation-impact': [
        { q: "Which asset classes beat inflation?", a: "Historically, equities (stocks) and real estate have consistently beaten inflation over long periods, whereas savings accounts often lag behind." }
    ],
    'asset-allocation': [
        { q: "How often should I rebalance?", a: "Rebalancing annually or when your allocation drifts by more than 5% from your target is a standard rigorous approach." }
    ],
    'credit-card-payoff': [
        { q: "Avalanche or Snowball method?", a: "Avalanche (paying highest interest first) saves money. Snowball (paying smallest debt first) builds psychological momentum. Both work if you stick to them." }
    ],
    'roi-calculator': [
        { q: "Does ROI include time?", a: "Standard ROI is just (Gain/Cost). To account for time, use Annualized ROI or CAGR." }
    ],
    'rule-of-72': [
        { q: "Is Rule of 72 exact?", a: "It's an approximation. It's very accurate for interest rates between 6% and 10%, but becomes less precise at very high or low rates." }
    ],
    'refinance-calculator': [
        { q: "When should I refinance?", a: "Consider refinancing if interest rates have dropped by at least 0.5-1.0% and you plan to stay in the home long enough to recoup the closing costs." }
    ],
    'topup-loan-emi': [
        { q: "Is a top-up loan cheaper than a personal loan?", a: "Yes, usually top-up loans on home loans have significantly lower interest rates than unsecured personal loans." }
    ],
    'emi-comparison': [
        { q: "Why compare EMIs?", a: "Different lenders offer different rates and tenures. Small differences in EMI can add up to huge differences in total interest paid." }
    ],
    'simple-interest': [
        { q: "Is simple interest used in banks?", a: "Most savings accounts use compound interest. Simple interest is rarely used for standard banking products, mostly for short-term personal loans or specific bonds." }
    ],
    'home-loan-eligibility': [
        { q: "How can I increase my eligibility?", a: "You can increase eligibility by adding a co-applicant, clearing existing debts, or increasing the loan tenure." }
    ],
    'property-loan-eligibility': [
        { q: "What is LTV?", a: "Loan to Value ratio. Banks typically fund only 75-90% of the property value; the rest must come from your own down payment." }
    ],
    'expense-ratio-calculator': [
        { q: "Is a lower expense ratio always better?", a: "Generally yes, for comparable funds. However, a fund with a slightly higher ratio that consistently generates much higher alpha (returns) might still be worth it." }
    ],
    'gst-calculator': [
        { q: "What are the current GST slabs?", a: "The primary GST slabs in India are 5%, 12%, 18%, and 28%. Gold is taxed at 3% and rough precious stones at 0.25%." }
    ],
    'nps-calculator': [
        { q: "Is NPS maturity tax-free?", a: "Yes, up to 60% of the corpus withdrawn as a lump sum at age 60 is tax-free. The remaining 40% must be used for annuity, which provides a taxable pension." }
    ],
    'ssy-calculator': [
        { q: "Can I withdraw SSY before 21 years?", a: "Partial withdrawal up to 50% is allowed for the girl's higher education or marriage after she turns 18. Premature closure is allowed only in specific medical emergencies." }
    ],
    '401k-calculator': [
        { q: "How much contributes to 401(k) in 2024?", a: "For 2024, the employee contribution limit is $23,000. If you are age 50 or older, you can contribute an additional $7,500 catch-up contribution." }
    ],
    'roth-ira-calculator': [
        { q: "Who can open a Roth IRA?", a: "Anyone with earned income can open a Roth IRA, provided their Modified Adjusted Gross Income (MAGI) is below the IRS limits set for the year." }
    ],
    '529-college-savings': [
        { q: "Can 529 funds be used for K-12?", a: "Yes, up to $10,000 per year per beneficiary can be used for tuition at K-12 public, private, or religious schools, in addition to college expenses." }
    ],
    'us-mortgage-calculator': [
        { q: "What is PMI and when does it go away?", a: "PMI (Private Mortgage Insurance) is usually required if you put down less than 20%. It automatically cancels when your loan balance typically reaches 78% of the original home value, or you can request cancellation at 80%." },
        { q: "Is mortgage interest tax deductible?", a: "Yes, for most taxpayers who itemize deductions, mortgage interest on the first $750,000 of indebtedness is deductible." }
    ],
    'rmd-calculator': [
        { q: "When must I take my first RMD?", a: "You must take your first RMD by April 1 of the year following the year you turn 73. For all subsequent years, you must take it by December 31." },
        { q: "Can I take more than the RMD amount?", a: "Yes, the RMD is just the *minimum* required. You can always withdraw more, but remember that regular withdrawals are taxed as ordinary income." }
    ],
    'us-capital-gains': [
        { q: "How are short-term gains taxed?", a: "Short-term capital gains (held for 1 year or less) are taxed as ordinary income, meaning they are subject to your federal income tax bracket rates (10% to 37%)." },
        { q: "What is tax-loss harvesting?", a: "This is a strategy where you sell investments that have lost value to offset the taxes you owe on your gains. Up to $3,000 of excess loss can also offset your ordinary income." }
    ],
    'social-security-break-even': [
        { q: "Will Social Security run out?", a: "The Social Security Trust Funds are projected to be depleted in the mid-2030s, at which point continuing tax income would be sufficient to pay roughly 80% of scheduled benefits. It is unlikely to disappear completely, but benefits may be reduced by Congressional action." },
        { q: "How does working affect my benefits?", a: "If you claim benefits before your Full Retirement Age and continue to work, your benefits will be reduced by $1 for every $2 you earn above the annual earnings limit ($22,320 in 2024). Once you reach FRA, you get these withheld amounts back." }
    ],
    'us-paycheck-calculator': [
        { q: "Why is my bonus taxed so high?", a: "Bonuses are considered 'supplemental wages' and are effectively withheld at a flat 22% rate for federal taxes, plus FICA and state taxes. This often feels higher than your regular paycheck withholding, though the actual tax liability is reconciled when you file your return." },
        { q: "Do I have to pay state tax where I live or where I work?", a: "Generally, if you live in one state and work in another, you file tax returns in both. You pay tax to the state where you work, and your home state usually gives you a credit for those taxes to avoid double taxation. Telecommuters usually pay tax based on where they live." }
    ],
    'hsa-calculator': [
        { q: "What is the 2024 HSA contribution limit?", a: "For 2024, the limit is $4,150 for individuals and $8,300 for families. If you are 55 or older, you can contribute an additional $1,000 'catch-up' contribution." },
        { q: "Do HSA funds expire?", a: "No. Unlike an FSA, HSA funds do not expire and roll over year after year. The account stays with you even if you change employers or health plans." }
    ],
    'hourly-to-salary': [
        { q: "How many working hours are in a year?", a: "A standard full-time work year (40 hours/week, 52 weeks) contains 2,080 working hours." },
        { q: "Should I use 50 or 52 weeks for my calculation?", a: "Use 52 weeks if you get paid vacation. Use 50 weeks if you take 2 weeks of unpaid time off per year." }
    ],
    'student-loan-payoff': [
        { q: "Should I focus on my student loans or invest?", a: "Generally, if your student loan interest rate is higher than what you expect to earn from investments, focus on the loan. For many, a balanced approach—building an emergency fund while paying down high-interest loans—is most effective." },
        { q: "How much interest can I save by paying an extra $100/month?", a: "On a typical $30,000 loan at 6% interest, an extra $100/month can save you over $4,000 in interest and shave nearly 4 years off your repayment timeline." }
    ],
    'student-loan-forgiveness': [
        { q: "What counts as a qualifying PSLF payment?", a: "A qualifying payment is one made while working full-time for a qualifying employer (government or non-profit), under a qualifying repayment plan, for the full amount due, after October 1, 2007." },
        { q: "Are forgiven student loans taxable?", a: "PSLF forgiveness is not federally taxable. However, forgiveness after 20-25 years under an IDR plan is currently considered taxable income (the 'tax bomb'), though this is temporarily paused federally through 2025." }
    ],
    'medicare-cost-estimator': [
        { q: "What is IRMAA and does it apply to me?", a: "IRMAA (Income-Related Monthly Adjustment Amount) is a surcharge on Part B and Part D premiums for those with higher income ($103k+ for singles, $206k+ for couples in 2024)." },
        { q: "How much should I budget for Medicare supplements?", a: "Medigap plans typically cost $150-$300 per month depending on your age, location, and plan type (e.g., Plan G is common)." }
    ],
    'aca-marketplace-calculator': [
        { q: "How do I qualify for ACA subsidies?", a: "Subsidies (Premium Tax Credits) are based on your household size and estimated annual income. Generally, you must earn between 100% and 400% of the Federal Poverty Level to qualify." },
        { q: "What is the 'benchmark' Silver plan?", a: "The benchmark plan is the second-lowest-cost Silver plan in your area. Your subsidy amount is calculated to make this specific plan cost a certain percentage of your income." }
    ],
    'child-tax-credit': [
        { q: "What are the income limits for the Child Tax Credit?", a: "The credit begins to phase out at $200,000 for single filers and $400,000 for married couples filing jointly." },
        { q: "Who counts as a qualifying child?", a: "A child must be under age 17 at the end of the year, have a Social Security number, and live with you for more than half the year." }
    ],
    'fsa-calculator': [
        { q: "What happens if I don't use the money in my FSA?", a: "FSAs are 'use-it-or-lose-it'. Some plans allow a carryover of up to $640 (for 2024) or a grace period of up to 2.5 months to spend the funds." },
        { q: "What expenses are FSA eligible?", a: "Eligible expenses include co-pays, deductibles, prescriptions, vision care, dental work, and over-the-counter medications." }
    ],
    'traditional-ira-calculator': [
        { q: "Can I deduct my Traditional IRA contribution?", a: "Deductibility depends on your income and whether you or your spouse are covered by a retirement plan at work. Phase-outs apply for higher earners." },
        { q: "What is an RMD?", a: "A Required Minimum Distribution (RMD) is the amount you must withdraw annually from your IRA starting at age 73 (for 2024) to avoid penalties." }
    ],
    'home-affordability-calculator': [
        { q: "What is the 28/36 rule?", a: "The 28/36 rule suggests that housing costs should not exceed 28% of gross monthly income, and total debt payments should not exceed 36%." },
        { q: "Should I include my partner's income?", a: "Yes, if you plan to buy the home together and both names will be on the mortgage, you should combine your gross annual incomes." }
    ],
    'auto-lease-vs-buy': [
        { q: "What is the 'money factor' in a lease?", a: "The money factor is essentially the interest rate on a lease. Multiply it by 2400 to get the roughly equivalent APR (e.g., 0.0025 * 2400 = 6%)." },
        { q: "When is leasing better than buying?", a: "Leasing is often better if you want a new car every 3 years, drive less than 12k miles/year, and prefer lower monthly payments over long-term equity." }
    ],
    'property-tax-estimator': [
        { q: "How is property tax calculated in the US?", a: "Property tax is usually calculated as (Assessed Value × Tax Rate). The assessed value is often a percentage of the market value, called the assessment ratio." },
        { q: "Is property tax deductible on federal taxes?", a: "Yes, if you itemize. You can deduct up to $10,000 for State and Local Taxes (SALT), which includes both property and either income or sales taxes." }
    ],
    'debt-avalanche-snowball': [
        { q: "Which method saves the most money?", a: "The Avalanche method always saves the most money because it eliminates high-interest debt first, reducing the total interest paid." },
        { q: "Why would someone choose the Snowball method?", a: "The Snowball method focuses on psychological wins by paying off small balances first, which can provide motivation to continue the debt payoff journey." }
    ],
    'fico-score-impact': [
        { q: "What is the most important factor in my FICO score?", a: "Payment history is the most important factor, accounting for 35% of your score. Missing even one payment can have a significant negative impact." },
        { q: "Will checking my score lower it?", a: "No. Checking your own score is a 'soft inquiry' and does not affect your FICO score. Only 'hard inquiries' from lenders when you apply for credit can lower it." }
    ],
    'uk-income-tax': [
        { q: "What is the Personal Allowance in the UK?", a: "The Personal Allowance is the amount of income you can earn before you start paying Income Tax. For the 2024/25 tax year, it is £12,570." },
        { q: "How much is National Insurance in 2024?", a: "Following the April 2024 budget, the main rate of Class 1 National Insurance for employees was reduced from 10% to 8%." },
        { q: "What is a 'Salary Sacrifice' pension?", a: "It's an agreement where you give up part of your gross salary in exchange for a non-cash benefit, like a pension contribution. This reduces your taxable income, saving you Income Tax and NI." }
    ],
    'australia-income-tax': [
        { q: "What are the Stage 3 tax cuts?", a: "Stage 3 tax cuts are changes to the Australian personal income tax brackets effective July 1, 2024, designed to provide broad-based tax relief for middle-income earners." },
        { q: "Is Superannuation included in my base salary?", a: "It depends on your contract. Some offers are 'Base + Super', while others are 'Package Inc. Super'. This calculator allows you to toggle between both." },
        { q: "Who pays the Medicare Levy?", a: "Most Australian residents pay a 2% Medicare Levy. Low-income earners may be exempt or pay a reduced rate." }
    ],
    'canada-income-tax': [
        { q: "How do RRSP contributions save tax?", a: "Contributions to a Registered Retirement Savings Plan (RRSP) are deducted from your gross income, reducing the amount of income you are taxed on for that year." },
        { q: "What is the max CPP contribution for 2024?", a: "For 2024, the maximum employee CPP contribution is $3,867.50, based on a 5.95% rate and the Maximum Pensionable Earnings limit." },
        { q: "Does this calculator handle all provinces?", a: "It uses an estimated average rate for the major provinces. For exact results, you should use a province-specific calculator as rates vary significantly in Quebec." }
    ],
    'europe-vat': [
        { q: "What is the standard VAT rate in Germany?", a: "As of 2024, the standard VAT rate in Germany is 19%, with a reduced rate of 7% for certain goods like food and books." },
        { q: "How do I remove VAT from a price?", a: "Divide the total price by (1 + VAT rate). For example, to remove 20% VAT: Gross / 1.20 = Net." },
        { q: "Are all EU countries' VAT rates the same?", a: "No, each EU member state sets its own VAT rates, though they must follow certain EU-wide minimums and rules." }
    ],
    'japan-paycheck': [
        { q: "What is Resident Tax (Jumin-zei) in Japan?", a: "Resident tax is a local tax (approx 10%) based on your previous year's income. Most employers deduct it monthly from your paycheck." },
        { q: "What does Social Insurance include in Japan?", a: "Standard Social Insurance (Shakai Hoken) includes Health Insurance, Employees' Pension (Kosei Nenkin), and Employment Insurance." },
        { q: "How are bonuses taxed in Japan?", a: "Bonuses are subject to the same health insurance, pension, and income tax rates as your regular salary, though the calculation logic differs slightly." }
    ],
    'hongkong-salary-tax': [
        { q: "Is MPF mandatory for everyone in HK?", a: "Most employees and self-employed persons in HK aged 18 to 64 are required to join an MPF scheme." },
        { q: "What is the difference between Progressive and Standard tax rates?", a: "Hong Kong calculates tax using both methods and charges you the LOWER amount. Progressive rates go up to 17%, while the standard rate is a flat 15% (for most) or 16% (high earners)." },
        { q: "Are dividends taxed in Hong Kong?", a: "Generally, there is no tax on dividends or capital gains in Hong Kong, making it a very tax-friendly environment for investors." }
    ],
    'china-income-tax': [
        { q: "What is the monthly tax-free threshold in China?", a: "The standard deduction for Individual Income Tax (IIT) is 5,000 RMB per month (60,000 RMB per year)." },
        { q: "What are 'Special Additional Deductions'?", a: "These are specific categories like children's education, continuing education, healthcare, and mortgage interest that can further reduce your taxable income." },
        { q: "Is Social Insurance mandatory for foreigners in China?", a: "In most cities, yes, foreigners working in China are required to participate in the social insurance system." }
    ],
    'switzerland-income-tax': [
        { q: "Why do Swiss taxes vary by Canton?", a: "Switzerland is a federal state where cantons and communes have significant autonomy to set their own income tax rates." },
        { q: "What is 'Tax at Source' (Quellensteuer)?", a: "Foreign workers on certain permits (like B or L) often have their taxes deducted directly from their salary by their employer." },
        { q: "Is health insurance part of social security in Switzerland?", a: "No, health insurance (Krankenkasse) is private and mandatory but not deducted from your gross salary; you must pay it yourself from your net income." }
    ],
    'singapore-tax': [
        { q: "What is the CPF wage ceiling for 2024?", a: "As of January 2024, the Ordinary Account (OA) wage ceiling is $6,800 per month." },
        { q: "Are foreigners required to pay CPF?", a: "No, CPF contributions are only mandatory for Singapore Citizens and Permanent Residents (PRs)." },
        { q: "How is Singapore's personal income tax calculated?", a: "It is based on a progressive residency-based system where rates increase as your assessable income rises." }
    ],
    'uae-gratuity': [
        { q: "Does the UAE have income tax on salaries?", a: "No, the UAE does not currently impose personal income tax on salaries earned by individuals." },
        { q: "Who is entitled to gratuity in the UAE?", a: "Expatriate employees who have completed at least one year of continuous service are entitled to an end-of-service gratuity." },
        { q: "Is gratuity calculated on total salary?", a: "No, gratuity is calculated based on the employee's 'basic salary' as specified in their contract, excluding allowances." }
    ],
    'nz-paycheck': [
        { q: "What is the ACC earner levy?", a: "It is a mandatory levy (approx 1.6%) that funds New Zealand's accident compensation scheme for non-work-related injuries." },
        { q: "Can I opt out of KiwiSaver?", a: "New employees are automatically enrolled but can choose to opt out between day 14 and day 56 of starting a new job." },
        { q: "How much is the student loan repayment rate in NZ?", a: "If you have a student loan and earn over the threshold, you typically repay 12% of every dollar earned above that threshold." }
    ],
    'india-tax': [
        { q: "Should I choose the New or Old Tax Regime?", a: "The New Regime generally benefits those with fewer investments and deductions, while the Old Regime is better for those with high HRA and 80C/80D savings." },
        { q: "What is the standard deduction in FY 2024-25?", a: "The standard deduction is ₹75,000 for the New Tax Regime and ₹50,000 for the Old Tax Regime." },
        { q: "Is the rebate under Section 87A available in both regimes?", a: "Yes, but with different limits: up to ₹7 Lakhs taxable income in the New Regime and ₹5 Lakhs in the Old Regime." }
    ],
    'ireland-tax': [
        { q: "What are the PRSI classes?", a: "Class A is the most common for private sector employees. Your class determines the rate of social insurance you pay and the benefits you receive." },
        { q: "What is the Universal Social Charge (USC)?", a: "USC is a tax on your gross income, introduced to replace other levies. It has its own set of progressive rates." },
        { q: "How do tax credits work in Ireland?", a: "Tax credits directly reduce the amount of Income Tax (PAYE) you pay. Everyone is entitled to personal and employee tax credits." }
    ],
    'mexico-isr': [
        { q: "What is the Aguinaldo in Mexico?", a: "The Aguinaldo is a mandatory year-end bonus equivalent to at least 15 days of salary, usually paid in December." },
        { q: "How much is the IMSS employee contribution?", a: "In 2024, the employee contribution to IMSS (Social Security) is approximately 2.5% to 3% of the base salary." },
        { q: "Is ISR calculated monthly or annually?", a: "ISR is withheld monthly by employers, but an annual reconciliation is mandatory for those earning above a certain threshold." }
    ],
    'brazil-clt': [
        { q: "What is the 13th salary in Brazil?", a: "Also known as the Gratificação Natalina, it is a mandatory extra month of salary paid to workers in two installments (November and December)." },
        { q: "What does the INSS contribution cover?", a: "INSS is the Brazilian social security contribution that funds pensions, maternity leave, and disability benefits." },
        { q: "Is FGTS deducted from my salary?", a: "No. FGTS (Fundo de Garantia do Tempo de Serviço) is an 8% contribution paid entirely by the employer on top of your monthly salary." }
    ],
    'south-africa-tax': [
        { q: "What is the South African tax year?", a: "The South African tax year for individuals runs from March 1st to the last day of February the following year." },
        { q: "Who is eligible for the Medical Schemes Fees Tax Credit?", a: "Any taxpayer who belongs to a registered medical scheme and pays the monthly contributions is eligible for this credit." },
        { q: "What is a Tax Rebate?", a: "A tax rebate is a direct reduction in the individual's tax liability. It is not a deduction from taxable income but a reduction of the final tax amount owed." }
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

