// src/app/admin/(protected)/analytics/page.tsx
import type { Metadata } from 'next';
import AnalyticsClient from './AnalyticsClient';

export const metadata: Metadata = {
    title: 'Healthcare Analytics & Platform Intelligence | Zydoc Admin',
    description: 'Enterprise healthcare metrics, consultation trends, doctor utilization, and revenue breakdown.',
};

export default function AdminAnalyticsPage() {
    return <AnalyticsClient />;
}
