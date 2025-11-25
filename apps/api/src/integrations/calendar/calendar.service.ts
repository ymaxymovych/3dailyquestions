import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { google } from 'googleapis';

@Injectable()
export class CalendarService {
    private oauth2Client;

    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
    ) {
        this.oauth2Client = new google.auth.OAuth2(
            this.configService.get('GOOGLE_CLIENT_ID'),
            this.configService.get('GOOGLE_CLIENT_SECRET'),
            this.configService.get('GOOGLE_CALLBACK_URL'),
        );
    }

    async getEvents(userId: string, date: string) {
        // 1. Get Integration
        const integration = await this.prisma.integration.findUnique({
            where: {
                userId_type: {
                    userId,
                    type: 'CALENDAR',
                },
            },
        });

        if (!integration || !integration.isEnabled || !integration.credentials) {
            throw new UnauthorizedException('Calendar integration not connected');
        }

        const credentials = integration.credentials as any;

        // 2. Set Credentials
        this.oauth2Client.setCredentials({
            access_token: credentials.accessToken,
            refresh_token: credentials.refreshToken,
        });

        // 3. Fetch Events
        const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        try {
            const response = await calendar.events.list({
                calendarId: 'primary',
                timeMin: startOfDay.toISOString(),
                timeMax: endOfDay.toISOString(),
                singleEvents: true,
                orderBy: 'startTime',
            });

            return response.data.items?.map((event) => ({
                id: event.id,
                summary: event.summary,
                start: event.start?.dateTime || event.start?.date,
                end: event.end?.dateTime || event.end?.date,
                link: event.htmlLink,
            })) || [];
        } catch (error) {
            console.error('Error fetching calendar events:', error);
            throw new UnauthorizedException('Failed to fetch calendar events. Please reconnect Google Account.');
        }
    }
}
