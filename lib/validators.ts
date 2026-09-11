export function isValidMobile(mobile: string): boolean {
  return /^\d{10}$/.test(mobile);
}

export function isValidName(name: string): boolean {
  return name.trim().length > 0;
}

export interface TokenFormErrors {
  name?: string;
  mobile?: string;
}

export function validateTokenForm(name: string, mobile: string): TokenFormErrors {
  const errors: TokenFormErrors = {};

  if (!isValidName(name)) {
    errors.name = 'Name is required';
  }

  if (!isValidMobile(mobile)) {
    errors.mobile = 'Mobile number must be exactly 10 digits';
  }

  return errors;
}
