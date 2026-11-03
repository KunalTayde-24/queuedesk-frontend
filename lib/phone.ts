// Mobile numbers are handled in international format ("+6591234567"): a country
// code chosen in the form plus the national digits.

export interface Country {
  code: string;
  short: string;
  name: string;
}

export const DEFAULT_COUNTRY = '+65';

export const COUNTRIES: Country[] = [
  { code: '+65', short: 'SG', name: 'Singapore' },
  { code: '+60', short: 'MY', name: 'Malaysia' },
  { code: '+62', short: 'ID', name: 'Indonesia' },
  { code: '+63', short: 'PH', name: 'Philippines' },
  { code: '+66', short: 'TH', name: 'Thailand' },
  { code: '+84', short: 'VN', name: 'Vietnam' },
  { code: '+91', short: 'IN', name: 'India' },
  { code: '+86', short: 'CN', name: 'China' },
  { code: '+852', short: 'HK', name: 'Hong Kong' },
  { code: '+81', short: 'JP', name: 'Japan' },
  { code: '+82', short: 'KR', name: 'South Korea' },
  { code: '+61', short: 'AU', name: 'Australia' },
  { code: '+44', short: 'UK', name: 'United Kingdom' },
  { code: '+1', short: 'US', name: 'US / Canada' },
];

/** Longest national number we let someone type for a country code. */
export function maxNationalDigits(code: string): number {
  return code === '+65' ? 8 : 12;
}

/** True for a full international number: "+", then 8-15 digits. Singapore numbers are 8 digits starting 3, 6, 8 or 9. */
export function isValidMobile(full: string): boolean {
  if (!/^\+[1-9]\d{7,14}$/.test(full)) return false;
  return full.startsWith('+65') ? /^\+65[3689]\d{7}$/.test(full) : true;
}

export function mobileErrorMessage(full: string): string {
  return full.startsWith('+65')
    ? 'Singapore numbers have 8 digits and start with 3, 6, 8 or 9'
    : 'Enter a valid mobile number for the selected country';
}

/** Numbers saved before country codes were stored are 10 Indian digits; show them with +91. */
export function displayMobile(mobile: string): string {
  return mobile.startsWith('+') ? mobile : `+91 ${mobile}`;
}

/** "+65 ••••• 4567" */
export function maskMobile(full: string, code: string): string {
  return `${code} ••••• ${full.slice(-4)}`;
}
