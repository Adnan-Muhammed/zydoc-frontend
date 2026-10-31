export type PatientProfileValidationResult = {
  errors: Record<string, string>;
  normalized: Record<string, string>;
};

const clean = (value: unknown) =>
  typeof value === 'string'
    ? value.replace(/[\u0000-\u001F\u007F]/g, ' ').replace(/\s+/g, ' ').trim()
    : '';

const hasLetterPattern = new RegExp(String.raw`[\p{L}\p{M}]`, 'u');
const hasLetterOrNumberPattern = new RegExp(String.raw`[\p{L}\p{M}\p{N}]`, 'u');
const namePattern = new RegExp(String.raw`^[\p{L}\p{M} .’'-]+$`, 'u');
const addressPattern = new RegExp(String.raw`^[\p{L}\p{M}\p{N}\s#.,'’&()/-]+$`, 'u');
const localityPattern = new RegExp(String.raw`^[\p{L}\p{M}\p{N}\s.'’&()/-]+$`, 'u');
const postalCodePattern = new RegExp(String.raw`^[\p{L}\p{N}][\p{L}\p{N} -]*[\p{L}\p{N}]$`, 'u');
const countryPattern = new RegExp(String.raw`^[\p{L}\p{M}\s.'’()-]+$`, 'u');
const relationshipPattern = new RegExp(String.raw`^[\p{L}\p{M}\s.'’()-]+$`, 'u');
const hasLetter = (value: string) => hasLetterPattern.test(value);
const validName = (value: string) =>
  value.length <= 50 && hasLetter(value) && namePattern.test(value);
const validPhone = (value: string) => {
  const digits = value.replace(/\D/g, '');
  return /^\+?[0-9][0-9\s().-]*$/.test(value) && digits.length >= 10 && digits.length <= 15;
};
const validAddressText = (value: string) =>
  value.length >= 5 && value.length <= 200 &&
  hasLetterOrNumberPattern.test(value) && !/^0+$/.test(value.replace(/\s/g, '')) &&
  addressPattern.test(value);
const validLocality = (value: string) =>
  value.length >= 2 && value.length <= 100 && hasLetter(value) &&
  localityPattern.test(value);
const validPostalCode = (value: string) => {
  const compact = value.replace(/[\s-]/g, '');
  return value.length >= 3 && value.length <= 12 &&
    postalCodePattern.test(value) &&
    !/^0+$/.test(compact);
};

export function validatePatientProfile(values: Record<string, unknown>): PatientProfileValidationResult {
  const errors: Record<string, string> = {};
  const normalized: Record<string, string> = {};
  const get = (key: string, nestedKey?: string) => clean(
    values[key] ?? (nestedKey ? (values.address as Record<string, unknown> | undefined)?.[nestedKey] : undefined)
  );

  normalized.firstName = get('firstName');
  normalized.lastName = get('lastName');
  normalized.phone = get('phone');
  normalized.street = get('street', 'street');
  normalized.city = get('city', 'city');
  normalized.state = get('state', 'state');
  normalized.zipCode = get('zipCode', 'zipCode');
  normalized.country = get('country', 'country');
  normalized.dateOfBirth = get('dateOfBirth');
  normalized.gender = get('gender');
  normalized.bloodGroup = get('bloodGroup');

  if (!normalized.firstName) errors.firstName = 'First name is required.';
  else if (!validName(normalized.firstName)) errors.firstName = 'Enter a valid first name.';

  if (normalized.lastName && !validName(normalized.lastName)) {
    errors.lastName = 'Enter a valid last name.';
  }

  if (!normalized.dateOfBirth) {
    errors.dateOfBirth = 'Date of birth is required.';
  } else {
    const birthDate = new Date(normalized.dateOfBirth);
    if (Number.isNaN(birthDate.getTime())) {
      errors.dateOfBirth = 'Enter a valid date of birth.';
    } else {
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (birthDate > today) errors.dateOfBirth = 'Date of birth cannot be in the future.';
    }
  }

  if (!['male', 'female', 'other'].includes(normalized.gender)) {
    errors.gender = 'Select a valid gender.';
  }

  if (!normalized.phone) errors.phone = 'Phone number is required.';
  else if (!validPhone(normalized.phone)) errors.phone = 'Enter a valid phone number with 10 to 15 digits.';

  if (!['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].includes(normalized.bloodGroup)) {
    errors.bloodGroup = 'Select a valid blood group.';
  }

  if (!normalized.street) errors.street = 'Street address is required.';
  else if (!validAddressText(normalized.street)) errors.street = 'Enter a valid street address.';

  if (!normalized.city) errors.city = 'City is required.';
  else if (!validLocality(normalized.city)) errors.city = 'Enter a valid city.';

  if (!normalized.state) errors.state = 'State / Province is required.';
  else if (!validLocality(normalized.state)) errors.state = 'Enter a valid state or province.';

  if (!normalized.zipCode) errors.zipCode = 'Postal / ZIP code is required.';
  else if (!validPostalCode(normalized.zipCode)) errors.zipCode = 'Enter a valid postal / ZIP code.';

  if (!normalized.country) errors.country = 'Country is required.';
  else if (normalized.country.length > 80 || normalized.country.length < 2 || !hasLetter(normalized.country) || !countryPattern.test(normalized.country)) {
    errors.country = 'Enter a valid country.';
  }

  const emergencyName = get('emergencyContactName');
  const emergencyRelationship = get('emergencyContactRelationship');
  const emergencyPhone = get('emergencyContactPhone');
  normalized.emergencyContactName = emergencyName;
  normalized.emergencyContactRelationship = emergencyRelationship;
  normalized.emergencyContactPhone = emergencyPhone;
  if (emergencyName && !validName(emergencyName)) errors.emergencyContactName = 'Enter a valid contact name.';
  if (emergencyRelationship && (emergencyRelationship.length > 50 || !hasLetter(emergencyRelationship) || !relationshipPattern.test(emergencyRelationship))) {
    errors.emergencyContactRelationship = 'Enter a valid relationship.';
  }
  if (emergencyPhone && !validPhone(emergencyPhone)) errors.emergencyContactPhone = 'Enter a valid contact phone number.';

  for (const field of ['allergies', 'chronicConditions', 'currentMedications']) {
    const value = get(field);
    normalized[field] = value;
    if (value.length > 2000) errors[field] = 'This field must be 2000 characters or fewer.';
  }

  return { errors, normalized };
}
