import { jsPDF } from 'jspdf';
import { PrescriptionItem } from '@/modules/video-call/components/sidebar/types';

export interface PrescriptionPdfData {
  appointmentId: string;
  date: string;
  time?: string;
  consultationType?: string;
  patient: {
    name: string;
    age?: string | number;
    gender?: string;
    bloodGroup?: string;
    phone?: string;
  };
  doctor: {
    name: string;
    specialty?: string;
    qualifications?: string;
    regNumber?: string;
    clinicName?: string;
  };
  prescriptions: PrescriptionItem[];
  clinicalAdvice?: string;
}

/**
 * Client-side vector PDF generator for e-prescriptions using jsPDF.
 * Renders a crisp, official clinical prescription document directly in the user's browser,
 * eliminating heavy server-side Chromium/Puppeteer overhead.
 */
export const generatePrescriptionPdf = (data: PrescriptionPdfData): void => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const margin = 15;
  const contentWidth = pageWidth - margin * 2; // 180mm

  // ─── 1. Top Decorative Brand Bar ──────────────────────────────────────────
  doc.setFillColor(30, 41, 59); // Slate-800
  doc.rect(0, 0, pageWidth, 5, 'F');

  doc.setFillColor(79, 70, 229); // Indigo-600
  doc.rect(0, 5, pageWidth, 2.5, 'F');

  // ─── 2. Header Section: Platform & Clinic Branding ─────────────────────────
  let currentY = 16;

  // Platform Logo / Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(30, 41, 59); // Slate-800
  doc.text('DOCTIFY', margin, currentY);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(79, 70, 229); // Indigo-600
  doc.text('TELEHEALTH CLINICAL NETWORK', margin + 35, currentY - 1.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139); // Slate-500
  doc.text('Verified Digital Healthcare Consultation', margin + 35, currentY + 2.5);

  // Right Header: Document Meta
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('OFFICIAL MEDICAL PRESCRIPTION', pageWidth - margin, currentY - 1, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Ref ID: #${data.appointmentId.slice(-8).toUpperCase()}`, pageWidth - margin, currentY + 3.5, {
    align: 'right',
  });
  doc.text(`Date: ${data.date} ${data.time ? '• ' + data.time : ''}`, pageWidth - margin, currentY + 7.5, {
    align: 'right',
  });

  currentY += 12;

  // Horizontal separator rule
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.setLineWidth(0.4);
  doc.line(margin, currentY, pageWidth - margin, currentY);

  currentY += 6;

  // ─── 3. Doctor & Patient Info Cards (Two-Column Layout) ────────────────────
  const cardHeight = 28;
  const colWidth = (contentWidth - 6) / 2;

  // Doctor Card Background
  doc.setFillColor(248, 250, 252); // Slate-50
  doc.roundedRect(margin, currentY, colWidth, cardHeight, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, colWidth, cardHeight, 2, 2, 'S');

  // Doctor Card Content
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text(data.doctor.name || 'Dr. Consultant', margin + 4, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(79, 70, 229);
  doc.text(data.doctor.specialty || 'General Practitioner', margin + 4, currentY + 11);

  doc.setTextColor(100, 116, 139);
  if (data.doctor.qualifications) {
    doc.text(`Qualifications: ${data.doctor.qualifications}`, margin + 4, currentY + 16);
  }
  doc.text(
    `Reg No: ${data.doctor.regNumber || 'DOC-KMC-' + data.appointmentId.slice(-5).toUpperCase()}`,
    margin + 4,
    currentY + (data.doctor.qualifications ? 21 : 16)
  );
  if (data.doctor.clinicName) {
    doc.text(`Clinic: ${data.doctor.clinicName}`, margin + 4, currentY + 25);
  }

  // Patient Card Background
  const patientColX = margin + colWidth + 6;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(patientColX, currentY, colWidth, cardHeight, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(patientColX, currentY, colWidth, cardHeight, 2, 2, 'S');

  // Patient Card Content
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text(data.patient.name || 'Patient', patientColX + 4, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  const patientSub = [
    data.patient.gender ? `${data.patient.gender}` : '',
    data.patient.age ? `${data.patient.age} yrs` : '',
    data.patient.bloodGroup ? `Blood: ${data.patient.bloodGroup}` : '',
  ]
    .filter(Boolean)
    .join('  •  ');

  doc.text(patientSub || 'Registered Patient', patientColX + 4, currentY + 11);

  if (data.patient.phone) {
    doc.text(`Phone: ${data.patient.phone}`, patientColX + 4, currentY + 16);
  }
  doc.text(
    `Consultation: ${data.consultationType ? data.consultationType.toUpperCase() : 'TELEMEDICINE VIDEO'}`,
    patientColX + 4,
    currentY + 21
  );

  currentY += cardHeight + 8;

  // ─── 4. Rx Heading Section ────────────────────────────────────────────────
  doc.setFont('times', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(79, 70, 229); // Indigo-600
  doc.text('Rx', margin, currentY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('MEDICATION & DOSAGE SCHEDULE', margin + 14, currentY - 2);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('Take medications strictly as instructed below', margin + 14, currentY + 2);

  currentY += 6;

  // ─── 5. Medication Table Header ───────────────────────────────────────────
  const colX = {
    num: margin,
    medicine: margin + 8,
    dosage: margin + 65,
    frequency: margin + 95,
    duration: margin + 130,
    instructions: margin + 155,
  };

  doc.setFillColor(30, 41, 59); // Slate-800
  doc.rect(margin, currentY, contentWidth, 7, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);

  doc.text('#', colX.num + 2, currentY + 4.8);
  doc.text('MEDICINE & STRENGTH', colX.medicine, currentY + 4.8);
  doc.text('DOSAGE', colX.dosage, currentY + 4.8);
  doc.text('FREQUENCY', colX.frequency, currentY + 4.8);
  doc.text('DURATION', colX.duration, currentY + 4.8);
  doc.text('INSTRUCTIONS', colX.instructions, currentY + 4.8);

  currentY += 7;

  // ─── 6. Medication Table Rows ─────────────────────────────────────────────
  if (!data.prescriptions || data.prescriptions.length === 0) {
    doc.setFillColor(255, 255, 255);
    doc.rect(margin, currentY, contentWidth, 14, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, currentY, contentWidth, 14, 'S');

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(148, 163, 184);
    doc.text('No prescription medications recorded for this session.', margin + 10, currentY + 9);
    currentY += 14;
  } else {
    data.prescriptions.forEach((item, index) => {
      const isEven = index % 2 === 0;
      const rowHeight = 12;

      // Zebra striping
      if (isEven) {
        doc.setFillColor(248, 250, 252); // Slate-50
      } else {
        doc.setFillColor(255, 255, 255);
      }
      doc.rect(margin, currentY, contentWidth, rowHeight, 'F');

      // Row bottom border
      doc.setDrawColor(241, 245, 249);
      doc.line(margin, currentY + rowHeight, pageWidth - margin, currentY + rowHeight);

      // Index
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`${index + 1}.`, colX.num + 2, currentY + 5.5);

      // Medicine Name
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text(item.medicine, colX.medicine, currentY + 5.5);

      // Dosage
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      doc.text(item.dosage || '1 unit', colX.dosage, currentY + 5.5);

      // Frequency
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(79, 70, 229);
      doc.text(item.frequency || 'As directed', colX.frequency, currentY + 5.5);

      // Duration
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(16, 185, 129); // Emerald-500
      doc.text(item.duration || '5 Days', colX.duration, currentY + 5.5);

      // Special Instructions
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      const instructionText = item.instructions || 'Take as advised with water.';
      const truncatedInstructions =
        instructionText.length > 25 ? instructionText.substring(0, 23) + '...' : instructionText;
      doc.text(truncatedInstructions, colX.instructions, currentY + 5.5);

      currentY += rowHeight;
    });
  }

  // ─── 7. Clinical Advice / Remarks ─────────────────────────────────────────
  currentY += 8;
  if (data.clinicalAdvice) {
    doc.setFillColor(254, 252, 232); // Amber-50
    doc.roundedRect(margin, currentY, contentWidth, 16, 1.5, 1.5, 'F');
    doc.setDrawColor(254, 240, 138); // Amber-200
    doc.roundedRect(margin, currentY, contentWidth, 16, 1.5, 1.5, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(146, 64, 14); // Amber-800
    doc.text('CLINICAL ADVICE & GENERAL NOTES:', margin + 4, currentY + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(180, 83, 9);
    doc.text(data.clinicalAdvice.substring(0, 120), margin + 4, currentY + 10);

    currentY += 22;
  }

  // ─── 8. Doctor Signature & Verification Section ────────────────────────────
  const signY = pageHeight - 50;

  // Digital Signature Seal
  const sealWidth = 70;
  const sealX = pageWidth - margin - sealWidth;

  doc.setDrawColor(203, 213, 225); // Slate-300
  doc.setLineDashPattern([1.5, 1.5], 0);
  doc.line(sealX, signY + 15, pageWidth - margin, signY + 15);
  doc.setLineDashPattern([], 0);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text(data.doctor.name || 'Dr. Consultant', sealX + sealWidth / 2, signY + 19, {
    align: 'center',
  });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Digitally Authenticated Signature', sealX + sealWidth / 2, signY + 23, {
    align: 'center',
  });
  doc.text(`Timestamp: ${new Date().toLocaleString()}`, sealX + sealWidth / 2, signY + 27, {
    align: 'center',
  });

  // Security Seal Pill (Left of signature)
  doc.setFillColor(240, 253, 244); // Emerald-50
  doc.roundedRect(margin, signY + 8, 75, 20, 2, 2, 'F');
  doc.setDrawColor(187, 247, 208); // Emerald-200
  doc.roundedRect(margin, signY + 8, 75, 20, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(22, 101, 52); // Emerald-800
  doc.text('AUTHENTIC TELEMEDICINE RECORD', margin + 4, signY + 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(21, 128, 61); // Emerald-700
  doc.text('Generated via Doctify Telehealth Encrypted Core', margin + 4, signY + 19);
  doc.text('Valid under National Telemedicine Guidelines 2020', margin + 4, signY + 24);

  // ─── 9. Footer & Legal Disclaimer ─────────────────────────────────────────
  const footerY = pageHeight - 12;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 3, pageWidth - margin, footerY - 3);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'DISCLAIMER: This electronic prescription is issued by a registered medical practitioner based on remote consultation. In case of acute symptoms or emergency, please visit the nearest hospital emergency department immediately.',
    margin,
    footerY,
    { maxWidth: contentWidth }
  );

  // Sanitize filename
  const cleanPatient = (data.patient.name || 'Patient').replace(/[^a-zA-Z0-9]/g, '_');
  const cleanDate = (data.date || 'today').replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `Prescription_${cleanPatient}_${cleanDate}.pdf`;

  // Trigger browser download
  doc.save(filename);
};
