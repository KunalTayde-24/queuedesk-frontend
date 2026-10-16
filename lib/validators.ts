export function isValidMobile(mobile: string): boolean {
  return /^\d{10}$/.test(mobile);
}

export function isValidName(name: string): boolean {
  return name.trim().length > 0;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
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

export interface RegistrationFormErrors {
  name?: string;
  mobile?: string;
  email?: string;
}

export function validateRegistrationForm(
  name: string,
  mobile: string,
  email: string,
): RegistrationFormErrors {
  const errors: RegistrationFormErrors = {};

  if (name.trim().length < 2) {
    errors.name = 'Enter your full name';
  }

  if (!isValidMobile(mobile)) {
    errors.mobile = 'Mobile number must be exactly 10 digits';
  }

  if (!isValidEmail(email)) {
    errors.email = 'Enter a valid email address';
  }

  return errors;
}

export interface EventFormErrors {
  title?: string;
  description?: string;
  venue?: string;
  registrationOpensAt?: string;
  registrationClosesAt?: string;
  startsAt?: string;
  endsAt?: string;
  schedule?: string;
}

export function validateEventForm(values: {
  title: string;
  description: string;
  venue: string;
  registrationOpensAt: string;
  registrationClosesAt: string;
  startsAt: string;
  endsAt: string;
}): EventFormErrors {
  const errors: EventFormErrors = {};

  if (values.title.trim().length < 3) {
    errors.title = 'Title must be at least 3 characters';
  }
  if (values.description.trim().length < 10) {
    errors.description = 'Description must be at least 10 characters';
  }
  if (values.venue.trim().length < 2) {
    errors.venue = 'Enter the venue';
  }

  const opens = Date.parse(values.registrationOpensAt);
  const closes = Date.parse(values.registrationClosesAt);
  const starts = Date.parse(values.startsAt);
  const ends = Date.parse(values.endsAt);
  const missing = [values.registrationOpensAt, values.registrationClosesAt, values.startsAt, values.endsAt].some(
    (value) => !value,
  );

  if (!values.registrationOpensAt) errors.registrationOpensAt = 'Choose when registration opens';
  if (!values.registrationClosesAt) errors.registrationClosesAt = 'Choose when registration closes';
  if (!values.startsAt) errors.startsAt = 'Choose when the event starts';
  if (!values.endsAt) errors.endsAt = 'Choose when the event ends';

  if (!missing && ![opens, closes, starts, ends].some((value) => Number.isNaN(value))) {
    if (!(opens < closes)) {
      errors.schedule = 'Registration close must be after registration open';
    } else if (closes > starts) {
      errors.schedule = 'Registration must close at or before the event starts';
    } else if (!(starts < ends)) {
      errors.schedule = 'Event end must be after the event starts';
    }
  }

  return errors;
}
