import { EmailLog, Subscriber, Language } from '../types';

export const MOCK_LOGS: EmailLog[] = Array.from({ length: 50 }).map((_, i) => {
  const status = Math.random() > 0.9 ? 'failed' : Math.random() > 0.8 ? 'queued' : 'sent';
  const typeIds = ['REG_CONFIRM_EMAIL', 'ONB_ORG_SETUP_REMINDER', 'MKT_NEWSLETTER_WELCOME', 'LEG_TERMS_UPDATE'];
  const typeId = typeIds[Math.floor(Math.random() * typeIds.length)];
  
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * 30));
  date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));

  return {
    id: `log-${i + 1}`,
    sentAt: date.toISOString(),
    typeId,
    recipient: `user${i + 1}@example.com`,
    status: status as any,
    error: status === 'failed' ? 'SMTP Connect Error' : undefined
  };
}).sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());

export const MOCK_SUBSCRIBERS: Subscriber[] = Array.from({ length: 100 }).map((_, i) => {
  const status = Math.random() > 0.8 ? 'pending' : Math.random() > 0.9 ? 'unsubscribed' : 'confirmed';
  
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * 60));

  return {
    id: `sub-${i + 1}`,
    email: `subscriber${i + 1}@domain.com`,
    status: status as any,
    source: Math.random() > 0.5 ? 'Landing Page' : 'Blog Popup',
    joinedAt: date.toISOString(),
    language: Math.random() > 0.3 ? Language.UA : Language.EN
  };
});