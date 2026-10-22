import { addYearsLocal, isRealLocal, nowLocalIst } from './datetime-local';

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

type ScheduleField = 'registrationOpensAt' | 'registrationClosesAt' | 'startsAt' | 'endsAt';

export interface EventFormOptions {
  /** The saved values when editing, so dates that were not changed are left alone. */
  original?: Partial<Record<ScheduleField, string>>;
  /** Override "now" ("YYYY-MM-DDTHH:mm", Indian time); used by tests. */
  now?: string;
}

const MAX_YEARS_AHEAD = 3;

export function validateEventForm(
  values: {
    title: string;
    description: string;
    venue: string;
    registrationOpensAt: string;
    registrationClosesAt: string;
    startsAt: string;
    endsAt: string;
  },
  options: EventFormOptions = {},
): EventFormErrors {
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

  const now = options.now ?? nowLocalIst();
  const limit = addYearsLocal(now, MAX_YEARS_AHEAD);
  const fields: ScheduleField[] = ['registrationOpensAt', 'registrationClosesAt', 'startsAt', 'endsAt'];

  if (!values.registrationOpensAt) errors.registrationOpensAt = 'Choose when registration opens';
  if (!values.registrationClosesAt) errors.registrationClosesAt = 'Choose when registration closes';
  if (!values.startsAt) errors.startsAt = 'Choose when the event starts';
  if (!values.endsAt) errors.endsAt = 'Choose when the event ends';

  // A value that is present must be a real calendar date and time.
  for (const field of fields) {
    const value = values[field];
    if (value && !isRealLocal(value)) errors[field] = 'Choose a real date and time';
  }

  // Past and far-future checks apply only to dates that are new or changed, so an
  // old event can still be edited. Registration may open in the past ("open now").
  const changed = (field: ScheduleField) => values[field] !== options.original?.[field];
  const pastMessage: Partial<Record<ScheduleField, string>> = {
    registrationClosesAt: 'Registration cannot close in the past',
    startsAt: 'The event cannot start in the past',
    endsAt: 'The event cannot end in the past',
  };
  for (const field of fields) {
    const value = values[field];
    if (errors[field] || !value || !changed(field)) continue;
    const message = pastMessage[field];
    if (message && value < now) errors[field] = message;
    else if (value > limit) errors[field] = `That is more than ${MAX_YEARS_AHEAD} years away. Check the year.`;
  }

  // Order: opens < closes <= starts < ends. Each pair is checked as soon as both of its dates
  // are filled in, so a conflict shows up while the form is still being completed.
  const real = (field: ScheduleField) => Boolean(values[field]) && isRealLocal(values[field]);
  if (real('registrationOpensAt') && real('registrationClosesAt')) {
    if (!(values.registrationOpensAt < values.registrationClosesAt)) {
      errors.registrationClosesAt ??= 'Registration must close after it opens';
    }
  }
  if (real('registrationClosesAt') && real('startsAt')) {
    if (values.registrationClosesAt > values.startsAt) {
      errors.registrationClosesAt ??= 'Registration must close before the event starts';
    }
  }
  if (real('startsAt') && real('endsAt')) {
    if (!(values.startsAt < values.endsAt)) {
      errors.endsAt ??= 'The event must end after it starts';
    }
  }

  return errors;
}
