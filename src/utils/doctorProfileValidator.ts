const letters = new RegExp(String.raw`[\p{L}\p{M}]`, 'u');
const name = new RegExp(String.raw`^[\p{L}\p{M} .’'-]+$`, 'u');
const addressChars = new RegExp(String.raw`^[\p{L}\p{M}\p{N}\s#.,'’&()/-]+$`, 'u');

export function validateDoctorName(value: string, label: string): string | null {
  const text = value.trim();
  if (text.length < 2 || text.length > 50 || !letters.test(text) || !name.test(text)) {
    return `Enter a valid ${label} (2–50 letters).`;
  }
  return null;
}

export function validateDoctorPhone(value: string): string | null {
  return /^\d{10,15}$/.test(value) ? null : 'Enter 10 to 15 digits only for the phone number.';
}

export function validateClinicName(value: string): string | null {
  const text = value.trim();
  if (text.length < 2 || text.length > 100 || !letters.test(text) || !addressChars.test(text)) {
    return 'Enter a valid clinic name.';
  }
  return null;
}

export function validateClinicAddress(value: string): string | null {
  const text = value.trim();
  if (text.length < 5 || text.length > 200 || (text.match(/\p{L}/gu) || []).length < 2 || !letters.test(text) || !addressChars.test(text) || /^0+$/.test(text.replace(/[\s,.-]/g, ''))) {
    return 'Enter a valid clinic address with a street or place name.';
  }
  return null;
}

export function validateDoctorFee(value: string | number, label: string): string | null {
  const fee = Number(value);
  if (value === '' || !Number.isFinite(fee) || fee < 0 || fee > 1_000_000) {
    return `Enter a valid ${label} between 0 and 1,000,000.`;
  }
  return null;
}
