
export enum EmailCategory {
  ACCESS = 'Access',
  ONBOARDING = 'Onboarding',
  LEGAL = 'Legal & Security',
  MARKETING = 'Marketing'
}

export enum Language {
  UA = 'uk',
  EN = 'en'
}

export interface EmailTemplate {
  subject: string;
  body: string;
}

export interface EmailType {
  id: string;
  name: string;
  description: string;
  category: EmailCategory;
  critical: boolean;
  enabled: boolean;
  recipients: string[];
  templates: Record<Language, EmailTemplate>;
  triggers?: string;
  availableVariables: string[]; // New field for editor hints
}

export interface EmailLog {
  id: string;
  sentAt: string;
  typeId: string;
  recipient: string;
  status: 'sent' | 'failed' | 'queued';
  error?: string;
}

export interface Subscriber {
  id: string;
  email: string;
  status: 'confirmed' | 'pending' | 'unsubscribed';
  source: string;
  joinedAt: string;
  language: Language;
}

export interface AppSettings {
  senderName: string;
  senderEmail: string;
  replyTo: string;
  primaryColor: string;
  dailyLimit: number;
}
