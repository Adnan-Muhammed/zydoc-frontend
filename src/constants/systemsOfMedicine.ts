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
