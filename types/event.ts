export type EventLifecycle = 'DRAFT' | 'PUBLISHED' | 'CANCELLED';

export interface EventSummary {
  id: string;
  title: string;
  description: string;
  venue: string;
  hasImage: boolean;
  imageUrl: string | null;
  startsAt: string;
  endsAt: string;
  status: EventLifecycle;
  createdAt: string;
  updatedAt: string;
}

export interface EventFormValues {
  title: string;
  description: string;
  venue: string;
  startsAt: string;
  endsAt: string;
}
