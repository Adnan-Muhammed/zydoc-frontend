/**
 * Converts a 24-hour time string (e.g. "14:30") to a 12-hour format string (e.g. "02:30 PM").
 * @param time24h The 24-hour time string.
 * @returns The 12-hour formatted time string.
 */
export function formatTo12Hour(time24h: string): string {
    if (!time24h || typeof time24h !== 'string') return '';
    const parts = time24h.split(':');
    if (parts.length < 2) return time24h;

    const h = parseInt(parts[0], 10);
    const m = parts[1];
    
    if (isNaN(h)) return time24h;

    const ampm = h >= 12 && h < 24 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    const formattedHour = String(hour12).padStart(2, '0');

    return `${formattedHour}:${m} ${ampm}`;
}
