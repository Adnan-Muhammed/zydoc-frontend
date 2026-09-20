// src/app/admin/(protected)/financials/page.tsx
import React from 'react';
import FinancialsClient from './FinancialsClient';

export const metadata = {
  title: 'Financial Ledger & Doctor Settlements | Zydoc Admin',
  description: 'Track platform gross consultation revenues, admin commissions, doctor payouts, and settle disbursements.',
};

export default function FinancialsPage() {
  return <FinancialsClient />;
}
