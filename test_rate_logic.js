
const { calculateLoanInterestRate } = require('./src/utils/finance.js');

// Reference Case from User Screenshot
const P = 1000000;
const EMI = 21617.95;
const Years = 5;

console.log("--- Verification Test ---");
console.log(`Principal: ${P}`);
console.log(`EMI: ${EMI}`);
console.log(`Years: ${Years}`);

const rate = calculateLoanInterestRate(P, EMI, Years);
console.log(`Calculated Rate: ${rate.toFixed(4)}%`);

const expectedRate = 10.75;
console.log(`Expected Rate: ~${expectedRate}%`);

if (Math.abs(rate - expectedRate) < 0.1) {
    console.log("✅ SUCCESS: Logic matches reference.");
} else {
    console.log("❌ FAILURE: Logic mismatch.");
}
