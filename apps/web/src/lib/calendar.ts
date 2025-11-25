import api from './api';

export interface CalendarEvent {
    id: string;
    summary: string;
    start: string;
    end: string;
    link?: string;
}

export const getCalendarEvents = async (date: string) => {
    return api.get<CalendarEvent[]>(`/integrations/calendar/events?date=${date}`);
};
