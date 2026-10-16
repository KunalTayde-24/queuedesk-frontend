export type EventLifecycle = 'DRAFT' | 'PUBLISHED' | 'CANCELLED';
export type RegistrationState = 'OPENS_SOON' | 'OPEN' | 'CLOSED';

export interface EventSummary {
  id: string;
  title: string;
  description: string;
  venue: string;
  hasImage: boolean;
  imageUrl: string | null;
  registrationOpensAt: string;
  registrationClosesAt: string;
  startsAt: string;
  endsAt: string;
  status: EventLifecycle;
  registrationState: RegistrationState;
  canRegister: boolean;
  registrationCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface EventFormValues {
  title: string;
  description: string;
  venue: string;
  registrationOpensAt: string;
  registrationClosesAt: string;
  startsAt: string;
  endsAt: string;
}

export interface RegistrationRequest {
  name: string;
  mobile: string;
  email: string;
}

export interface EventRegistrationResult {
  id: string;
  confirmationRef: string;
  eventId: string;
  name: string;
  email: string;
  registeredAt: string;
}

export interface Registrant {
  id: string;
  name: string;
  mobile: string;
  email: string;
  status: 'REGISTERED' | 'CANCELLED';
  confirmationRef: string;
  registeredAt: string;
}
