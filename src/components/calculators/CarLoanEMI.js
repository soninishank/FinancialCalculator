
import React from 'react';
import LoanEMI from './LoanEMI';

export default function CarLoanEMI({ currency, setCurrency }) {
    return (
        <LoanEMI
            currency={currency}
            setCurrency={setCurrency}
            defaults={{
                principal: 500000,
                rate: 8.5,
                tenure: 5
            }}
            detailsKey="car-loan-emi"
        />
    );
}
