const nlp = require('compromise');
const NodeCache = require('node-cache');

// Cache to avoid re-processing same text (24hr TTL)
const extractionCache = new NodeCache({ stdTTL: 86400 });

class IssueSizeExtractor {
    constructor() {
        console.log('[NLP Extractor] Initialized with Compromise.js');
    }

    async extractIssueSize(issueSizeText, pricePerShare = null) {
        if (!issueSizeText || issueSizeText.trim() === '') {
            return this.emptyResult();
        }

        // Check cache first
        const cacheKey = `${issueSizeText}-${pricePerShare}`;
        const cached = extractionCache.get(cacheKey);
        if (cached) {
            return cached;
        }

        try {
            const result = this.nlpExtract(issueSizeText, pricePerShare);
            extractionCache.set(cacheKey, result);
            return result;
        } catch (error) {
            console.error('[NLP Extractor] Error:', error.message);
            return this.fallbackExtraction(issueSizeText, pricePerShare);
        }
    }

    nlpExtract(text, price) {
        const doc = nlp(text);

        // Extract all money values with context
        const moneyPatterns = this.extractMoneyValues(text);
        const sharePatterns = this.extractShareValues(text);

        // Build result by analyzing context
        const extracted = {
            fresh_issue: { amount_inr: null, shares: null },
            offer_for_sale: { amount_inr: null, shares: null },
            total: { amount_inr: 0, shares: 0 },
            confidence: 'medium',
            reasoning: 'NLP-based extraction using Compromise.js',
            special_notes: 'standard'
        };

        // Detect special cases
        if (text.toLowerCase().includes('bond') || text.toLowerCase().includes('ncd')) {
            extracted.special_notes = 'bonds';
        } else if (text.toLowerCase().includes('unit')) {
            extracted.special_notes = 'units';
        }

        // Extract Fresh Issue amounts
        const freshAmountMatch = this.findValueNearKeywords(moneyPatterns, ['fresh', 'issue']);
        if (freshAmountMatch) {
            extracted.fresh_issue.amount_inr = freshAmountMatch.value;
            extracted.confidence = 'high';
        }

        // Extract Fresh Issue shares
        const freshSharesMatch = this.findValueNearKeywords(sharePatterns, ['fresh', 'issue'], true);
        if (freshSharesMatch) {
            extracted.fresh_issue.shares = freshSharesMatch.value;
            // Calculate amount if we have price
            if (price && !extracted.fresh_issue.amount_inr) {
                extracted.fresh_issue.amount_inr = freshSharesMatch.value * price;
                extracted.confidence = 'high';
            }
        }

        // Extract Offer for Sale amounts
        const ofsAmountMatch = this.findValueNearKeywords(moneyPatterns, ['offer', 'sale']);
        if (ofsAmountMatch) {
            extracted.offer_for_sale.amount_inr = ofsAmountMatch.value;
            extracted.confidence = 'high';
        }

        // Extract Offer for Sale shares
        const ofsSharesMatch = this.findValueNearKeywords(sharePatterns, ['offer', 'sale'], true);
        if (ofsSharesMatch) {
            extracted.offer_for_sale.shares = ofsSharesMatch.value;
            // Calculate amount if we have price
            if (price && !extracted.offer_for_sale.amount_inr) {
                extracted.offer_for_sale.amount_inr = ofsSharesMatch.value * price;
                extracted.confidence = 'high';
            }
        }

        // If we didn't find separated values, look for total/aggregating
        if (!extracted.fresh_issue.amount_inr && !extracted.offer_for_sale.amount_inr) {
            const totalAmountMatch = this.findValueNearKeywords(moneyPatterns, ['aggregating', 'total']);
            if (totalAmountMatch) {
                extracted.total.amount_inr = totalAmountMatch.value;
                extracted.confidence = 'medium';
            } else if (moneyPatterns.length > 0) {
                // Use first/largest amount found
                extracted.total.amount_inr = moneyPatterns[0].value;
                extracted.confidence = 'low';
                extracted.reasoning = 'Used first money value found (context unclear)';
            }
        }

        // If we have shares but no amount, try with price
        const totalSharesMatch = this.findValueNearKeywords(sharePatterns, ['aggregating', 'total'], true);
        if (totalSharesMatch && price) {
            if (!extracted.total.amount_inr) {
                extracted.total.amount_inr = totalSharesMatch.value * price;
                extracted.total.shares = totalSharesMatch.value;
                extracted.confidence = 'medium';
            }
        } else if (sharePatterns.length > 0 && price && !extracted.fresh_issue.shares && !extracted.offer_for_sale.shares) {
            // Use first share value
            extracted.total.shares = sharePatterns[0].value;
            extracted.total.amount_inr = sharePatterns[0].value * price;
            extracted.confidence = 'low';
        }

        // Calculate totals from parts
        const calculatedAmount = (extracted.fresh_issue.amount_inr || 0) + (extracted.offer_for_sale.amount_inr || 0);
        const calculatedShares = (extracted.fresh_issue.shares || 0) + (extracted.offer_for_sale.shares || 0);

        if (calculatedAmount > 0) {
            extracted.total.amount_inr = calculatedAmount;
        }
        if (calculatedShares > 0) {
            extracted.total.shares = calculatedShares;
        }

        return this.validateAndNormalize(extracted, text, 'nlp-compromise');
    }

    extractMoneyValues(text) {
        const results = [];

        // Pattern: Rs./Re. followed by number and unit
        const regex = /Rs\.?\s*([0-9,]+\.?\d*)\s*(million|crore|lakhs?|Lakhs?)?/gi;
        let match;

        while ((match = regex.exec(text)) !== null) {
            const value = parseFloat(match[1].replace(/,/g, ''));
            const unit = (match[2] || '').toLowerCase();

            // Check if followed by "Shares" (means it's not a money value)
            const nextChars = text.substring(match.index + match[0].length, match.index + match[0].length + 20);
            if (nextChars.match(/^\s*(Equity\s*)?Shares/i)) {
                continue;
            }

            let inr = value;
            if (unit.includes('million')) inr = value * 1000000;
            else if (unit.includes('crore')) inr = value * 10000000;
            else if (unit.startsWith('lakh')) inr = value * 100000;

            results.push({
                value: inr,
                index: match.index,
                context: text.substring(Math.max(0, match.index - 50), match.index + 50)
            });
        }

        return results;
    }

    extractShareValues(text) {
        const results = [];

        // Pattern: number followed by "Shares" or "Equity Shares"
        const regex = /([0-9,]+)\s*(?:Equity\s*)?Shares/gi;
        let match;

        while ((match = regex.exec(text)) !== null) {
            const value = parseInt(match[1].replace(/,/g, ''));

            results.push({
                value: value,
                index: match.index,
                context: text.substring(Math.max(0, match.index - 50), match.index + 50)
            });
        }

        return results;
    }

    findValueNearKeywords(patterns, keywords, isShares = false) {
        // Find the pattern closest to any of the keywords
        let bestMatch = null;
        let minDistance = Infinity;

        for (const pattern of patterns) {
            const contextLower = pattern.context.toLowerCase();

            for (const keyword of keywords) {
                if (contextLower.includes(keyword.toLowerCase())) {
                    const keywordIndex = contextLower.indexOf(keyword.toLowerCase());
                    const distance = Math.abs(keywordIndex - 25); // 25 is middle of context window

                    if (distance < minDistance) {
                        minDistance = distance;
                        bestMatch = pattern;
                    }
                }
            }
        }

        return bestMatch;
    }

    fallbackExtraction(text, price) {
        // Simple regex fallback
        const freshAmountMatch = text.match(/Fresh\s+Issue.*?Rs\.?\s*([0-9,]+\.?\d*)\s*(million|crore|lakhs?)/i);
        const ofsAmountMatch = text.match(/Offer\s+for\s+Sale.*?Rs\.?\s*([0-9,]+\.?\d*)\s*(million|crore|lakhs?)/i);

        const extracted = {
            fresh_issue: {
                amount_inr: freshAmountMatch ? this.convertToINR(freshAmountMatch[1], freshAmountMatch[2]) : null,
                shares: null
            },
            offer_for_sale: {
                amount_inr: ofsAmountMatch ? this.convertToINR(ofsAmountMatch[1], ofsAmountMatch[2]) : null,
                shares: null
            },
            total: { amount_inr: 0, shares: 0 },
            confidence: 'low',
            reasoning: 'Fallback regex extraction',
            special_notes: 'fallback'
        };

        extracted.total.amount_inr = (extracted.fresh_issue.amount_inr || 0) + (extracted.offer_for_sale.amount_inr || 0);

        return this.validateAndNormalize(extracted, text, 'regex-fallback');
    }

    convertToINR(value, unit) {
        const num = parseFloat(value.replace(/,/g, ''));
        const unitLower = (unit || '').toLowerCase();

        if (unitLower.includes('million')) return num * 1000000;
        if (unitLower.includes('crore')) return num * 10000000;
        if (unitLower.startsWith('lakh')) return num * 100000;

        return num;
    }

    validateAndNormalize(extracted, rawText, method) {
        // Convert to paise for database storage
        const result = {
            raw: rawText,
            freshIssue: {
                amount: this.convertToPaise(extracted.fresh_issue?.amount_inr),
                shares: extracted.fresh_issue?.shares || 0
            },
            offerForSale: {
                amount: this.convertToPaise(extracted.offer_for_sale?.amount_inr),
                shares: extracted.offer_for_sale?.shares || 0
            },
            totalAmount: this.convertToPaise(extracted.total?.amount_inr),
            totalShares: extracted.total?.shares || 0,
            confidence: extracted.confidence || 'medium',
            method: method,
            reasoning: extracted.reasoning || '',
            specialNotes: extracted.special_notes || '',
            warnings: []
        };

        // Sanity checks
        if (result.totalAmount > 100000000000000) { // 10,000 crores in paise
            result.warnings.push('Unrealistically high amount');
            result.confidence = 'low';
        }

        if (result.totalAmount === 0 && result.totalShares === 0) {
            result.warnings.push('No data extracted');
            result.confidence = 'manual_review';
        }

        // Check if parts sum to total (within 5% tolerance)
        const partsSum = result.freshIssue.amount + result.offerForSale.amount;
        if (result.totalAmount > 0 && partsSum > 0) {
            const diff = Math.abs(partsSum - result.totalAmount);
            const tolerance = result.totalAmount * 0.05;
            if (diff > tolerance) {
                result.warnings.push(`Parts sum differs from total by more than 5%`);
            }
        }

        return result;
    }

    convertToPaise(amountInr) {
        if (!amountInr || amountInr === 0) return 0;
        return Math.round(amountInr * 100); // INR to paise
    }

    emptyResult() {
        return {
            raw: '',
            freshIssue: { amount: 0, shares: 0 },
            offerForSale: { amount: 0, shares: 0 },
            totalAmount: 0,
            totalShares: 0,
            confidence: 'manual_review',
            method: 'none',
            reasoning: 'No issue size text provided',
            warnings: ['Empty input']
        };
    }
}

module.exports = new IssueSizeExtractor();
