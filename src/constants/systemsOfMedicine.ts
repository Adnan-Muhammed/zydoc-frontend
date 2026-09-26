// src/constants/systemsOfMedicine.ts

export interface SystemOfMedicineConfig {
    id: string;
    label: string;
    licenseLabel: string;
    specialties: string[];
    degreePresets: string[];
}

export const SYSTEMS_OF_MEDICINE: Record<string, SystemOfMedicineConfig> = {
    ALLOPATHY: {
        id: "Modern Medicine",
        label: "Modern Medicine (Allopathy)",
        licenseLabel: "Medical Council Registration Number",
        specialties: [
            "General Medicine",
            "Cardiology",
            "Dermatology",
            "Pediatrics",
            "Neurology",
            "Orthopedics",
            "Gynecology",
            "Psychiatry",
            "ENT / Otorhinolaryngology",
            "Ophthalmology",
            "Gastroenterology",
            "Pulmonology",
        ],
        degreePresets: ["MBBS", "MD", "MS", "DNB", "DM", "MCh"],
    },
    HOMEOPATHY: {
        id: "Homeopathy",
        label: "Homeopathy",
        licenseLabel: "Homeopathic Medical Council Registration Number",
        specialties: [
            "General Homeopathy",
            "Classical Homeopathy",
            "Constitutional Homeopathy",
            "Pediatric Homeopathy",
            "Chronic Disease Care",
            "Dermatological Homeopathy",
        ],
        degreePresets: ["BHMS", "MD (Homeopathy)", "PG Diploma (Hom)"],
    },
    AYURVEDA: {
        id: "Ayurveda",
        label: "Ayurveda",
        licenseLabel: "Ayurvedic Medical Board / NCISM Registration Number",
        specialties: [
            "General Ayurveda",
            "Kayachikitsa (Internal Medicine)",
            "Panchakarma",
            "Shalya Tantra (Surgery)",
            "Shalakya Tantra (ENT & Ophthalmology)",
            "Kaumarbhritya (Pediatrics)",
            "Prasuti & Stri Roga (Gynecology & Obstetrics)",
            "Swasthavritta (Preventive & Lifestyle Care)",
        ],
        degreePresets: ["BAMS", "MD (Ayurveda)", "MS (Ayurveda)"],
    },
    DENTISTRY: {
        id: "Dentistry",
        label: "Dentistry",
        licenseLabel: "Dental Council Registration Number",
        specialties: [
            "General Dentistry",
            "Orthodontics & Dentofacial Orthopedics",
            "Endodontics & Conservative Dentistry",
            "Periodontics",
            "Oral & Maxillofacial Surgery",
            "Prosthodontics",
            "Pediatric Dentistry",
            "Oral Pathology & Microbiology",
        ],
        degreePresets: ["BDS", "MDS"],
    },
    PSYCHOLOGY: {
        id: "Psychology",
        label: "Psychology",
        licenseLabel: "RCI Registration / Professional License Number",
        specialties: [
            "Clinical Psychology",
            "Counseling Psychology",
            "Child & Adolescent Psychology",
            "Cognitive Behavioral Therapy (CBT)",
            "Neuropsychology",
            "Psychotherapy & Marriage Counseling",
            "Health & Rehabilitation Psychology",
        ],
        degreePresets: [
            "B.A. / B.Sc Psychology",
            "M.A. / M.Sc Clinical Psychology",
            "M.Phil Clinical Psychology",
            "Psy.D",
            "Ph.D",
        ],
    },
};

export const SYSTEMS_LIST = Object.values(SYSTEMS_OF_MEDICINE);

export const DEFAULT_SYSTEM_OF_MEDICINE = SYSTEMS_OF_MEDICINE.ALLOPATHY.id;

export const getSystemConfigById = (id?: string): SystemOfMedicineConfig => {
    if (!id) return SYSTEMS_OF_MEDICINE.ALLOPATHY;
    const found = SYSTEMS_LIST.find(
        (sys) => sys.id.toLowerCase() === id.trim().toLowerCase()
    );
    return found || SYSTEMS_OF_MEDICINE.ALLOPATHY;
};

/**
 * Normalizes system of medicine strings and common aliases.
 * E.g., 'allopathy' -> 'Modern Medicine'
 */
export const normalizeSystemOfMedicine = (system?: string | null): string => {
    if (!system || typeof system !== 'string') return 'Modern Medicine';
    const trimmed = system.trim().toLowerCase();

    if (trimmed === 'allopathy' || trimmed === 'modern medicine') {
        return 'Modern Medicine';
    }
    if (trimmed === 'homeopathy' || trimmed === 'homoeopathy') {
        return 'Homeopathy';
    }
    if (trimmed === 'ayurveda' || trimmed === 'ayush') {
        return 'Ayurveda';
    }
    if (trimmed === 'dentistry' || trimmed === 'dental') {
        return 'Dentistry';
    }
    if (trimmed === 'psychology' || trimmed === 'mental health') {
        return 'Psychology';
    }

    const match = SYSTEMS_LIST.find(
        (s) => s.id.toLowerCase() === trimmed
    );
    return match ? match.id : 'Modern Medicine';
};

/**
 * Intelligently deduces the System of Medicine based on degrees.
 * Handles critical edge cases:
 * - Doctors entering only "MD" or "MS" without MBBS -> maps to "Modern Medicine"
 * - Homeopathy higher degrees like "MD (Homeopathy)" -> maps to "Homeopathy"
 * - Ayurveda higher degrees like "MD (Ayurveda)" -> maps to "Ayurveda"
 * - Dentistry degrees (BDS, MDS) -> maps to "Dentistry"
 * - Psychology degrees (Psy.D, M.Phil, M.Sc Psychology) -> maps to "Psychology"
 */
export const deduceSystemOfMedicine = (qualifications?: any[], currentSystem?: string | null): string => {
    const normalizedCurrent = currentSystem ? normalizeSystemOfMedicine(currentSystem) : null;

    if (!qualifications || !Array.isArray(qualifications) || qualifications.length === 0) {
        return normalizedCurrent || 'Modern Medicine';
    }

    const degreeStrings = qualifications
        .map((q) => {
            if (!q) return '';
            if (typeof q === 'string') return q;
            return q.degree || q.name || q.title || '';
        })
        .filter(Boolean);

    if (degreeStrings.length === 0) {
        return normalizedCurrent || 'Modern Medicine';
    }

    for (const deg of degreeStrings) {
        const d = deg.trim().toLowerCase();

        // 1. Homeopathy check
        if (
            /\b(bhms|dhms)\b/i.test(d) ||
            d.includes('homeo') ||
            d.includes('homoeo')
        ) {
            return 'Homeopathy';
        }

        // 2. Ayurveda check
        if (
            /\b(bams|bums|bsms)\b/i.test(d) ||
            d.includes('ayur') ||
            d.includes('panchakarma')
        ) {
            return 'Ayurveda';
        }

        // 3. Dentistry check
        if (
            /\b(bds|mds|dds|dmd)\b/i.test(d) ||
            d.includes('dental') ||
            d.includes('dentistry')
        ) {
            return 'Dentistry';
        }

        // 4. Psychology check
        if (
            /\b(psy\.?d|psyd)\b/i.test(d) ||
            d.includes('psycholog') ||
            d.includes('psychotherapy') ||
            (/\bm\.?phil\b/i.test(d) && d.includes('psych')) ||
            (/\bm\.?sc\b/i.test(d) && d.includes('psych')) ||
            (/\bb\.?sc\b/i.test(d) && d.includes('psych')) ||
            (/\bm\.?a\b/i.test(d) && d.includes('psych')) ||
            (/\bb\.?a\b/i.test(d) && d.includes('psych'))
        ) {
            return 'Psychology';
        }

        // 5. Modern Medicine (Allopathy) check
        // Edge case: "MD", "MS", "MBBS", "DNB", "DM", "MCh", "MRCP", "FRCS", "FCPS"
        if (
            /\b(mbbs|dnb|mch|dm|mrcp|frcs|fcps)\b/i.test(d) ||
            /\b(md|ms)\b/i.test(d) ||
            d.includes('medicine') ||
            d.includes('surgery') ||
            d.includes('pediatric') ||
            d.includes('gynec') ||
            d.includes('ortho') ||
            d.includes('cardio')
        ) {
            return 'Modern Medicine';
        }
    }

    return normalizedCurrent || 'Modern Medicine';
};

/**
 * Extracts clean primary degrees to display next to/below doctor name
 * E.g., [{degree: 'MBBS'}, {degree: 'MD General Medicine'}] -> "MBBS, MD"
 * E.g., [{degree: 'MD'}] -> "MD"
 */
export const extractPrimaryQualifications = (qualifications?: any[] | string): string => {
    if (!qualifications) return '';
    if (typeof qualifications === 'string') return qualifications.trim();
    if (!Array.isArray(qualifications) || qualifications.length === 0) return '';

    const cleanedDegrees = qualifications
        .map((q) => {
            if (!q) return '';
            const raw = typeof q === 'string' ? q : q.degree || q.name || '';
            return raw.trim();
        })
        .filter(Boolean);

    if (cleanedDegrees.length === 0) return '';

    const standardAcronyms = [
        'MBBS', 'MD', 'MS', 'DNB', 'DM', 'MCh', 'MRCP', 'FRCS',
        'BDS', 'MDS',
        'BHMS', 'DHMS',
        'BAMS',
        'Psy.D', 'Ph.D', 'M.Phil'
    ];

    const simplified: string[] = [];
    for (const deg of cleanedDegrees) {
        let matched: string | null = null;
        for (const acr of standardAcronyms) {
            const regex = new RegExp(`\\b${acr.replace('.', '\\.')}\\b`, 'i');
            if (regex.test(deg)) {
                matched = acr;
                break;
            }
        }
        if (matched && !simplified.includes(matched)) {
            simplified.push(matched);
        } else if (!matched && !simplified.includes(deg)) {
            simplified.push(deg);
        }
    }

    return simplified.slice(0, 3).join(', ');
};
