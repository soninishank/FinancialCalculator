import React from 'react';
import LoanEMI from './LoanEMI';

export default function VehicleLoanEMI(props) {
    const vehicleDefaults = {
        principal: 500000,
        rate: 8.5,
        tenure: 5
    };

    return <LoanEMI {...props} defaults={vehicleDefaults} />;
}
