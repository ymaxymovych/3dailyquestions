import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(
        private configService: ConfigService,
        private authService: AuthService,
    ) {
        super({
            clientID: configService.get<string>('GOOGLE_CLIENT_ID') || 'PLACEHOLDER_ID',
            clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') || 'PLACEHOLDER_SECRET',
            callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL') || 'http://localhost:3000/api/auth/google/callback',
            scope: ['email', 'profile', 'https://www.googleapis.com/auth/calendar.readonly'],
        });
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: VerifyCallback,
    ): Promise<any> {
        const { name, emails, photos, id } = profile;
        const user = await this.authService.validateGoogleUser({
            email: emails[0].value,
            firstName: name.givenName,
            lastName: name.familyName,
            picture: photos[0].value,
            googleId: id,
            accessToken,
            refreshToken,
        });
        done(null, user);
    }
}
