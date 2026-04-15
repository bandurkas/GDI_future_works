// Phone format validation per country code
// Returns { valid, error } — error keys can be localized by caller

const RULES: Record<string, { min: number; max: number; startsWith?: string[] }> = {
  '+62': { min: 9, max: 13, startsWith: ['8'] },       // Indonesia: mobile starts with 8, 9–13 digits
  '+60': { min: 9, max: 10, startsWith: ['1'] },       // Malaysia: mobile starts with 1
  '+65': { min: 8, max: 8, startsWith: ['8', '9'] },   // Singapore: 8 digits, starts 8 or 9
  '+1':  { min: 10, max: 10 },                          // US: 10 digits
};

export interface PhoneValidation {
  valid: boolean;
  errorId?: 'too_short' | 'too_long' | 'wrong_prefix' | 'empty';
}

export function validatePhone(countryCode: string, localDigitsRaw: string): PhoneValidation {
  const local = (localDigitsRaw || '').replace(/\D/g, '').replace(/^0+/, '');
  if (!local) return { valid: false, errorId: 'empty' };
  const rule = RULES[countryCode];
  if (!rule) return { valid: local.length >= 7 };
  if (local.length < rule.min) return { valid: false, errorId: 'too_short' };
  if (local.length > rule.max) return { valid: false, errorId: 'too_long' };
  if (rule.startsWith && !rule.startsWith.some(p => local.startsWith(p))) {
    return { valid: false, errorId: 'wrong_prefix' };
  }
  return { valid: true };
}

export function buildFullPhone(countryCode: string, localDigitsRaw: string): string {
  const ccDigits = countryCode.replace(/\D/g, '');
  let local = (localDigitsRaw || '').replace(/\D/g, '').replace(/^0+/, '');
  if (local.startsWith(ccDigits)) local = local.slice(ccDigits.length);
  return local ? `+${ccDigits}${local}` : '';
}

export function phoneErrorText(errorId: PhoneValidation['errorId'], lang: 'id' | 'en' = 'id'): string {
  const map: Record<NonNullable<PhoneValidation['errorId']>, { id: string; en: string }> = {
    empty:        { id: 'Masukkan nomor telepon', en: 'Enter phone number' },
    too_short:    { id: 'Nomor terlalu pendek', en: 'Phone number is too short' },
    too_long:     { id: 'Nomor terlalu panjang', en: 'Phone number is too long' },
    wrong_prefix: { id: 'Format nomor tidak sesuai untuk negara ini', en: 'Invalid number format for this country' },
  };
  if (!errorId) return '';
  return map[errorId][lang];
}
