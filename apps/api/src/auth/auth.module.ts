import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { GoogleStrategy } from './google.strategy';
import { PrismaModule } from '../prisma/prisma.module';
import { UserAdminModule } from '../user-admin/user-admin.module';

@Module({
    imports: [
        PrismaModule,
        UserAdminModule,
        PassportModule,
        JwtModule.register({
            global: true,
            secret: process.env.JWT_SECRET || 'dev-secret-key',
            signOptions: { expiresIn: '1d' },
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy, GoogleStrategy],
})
export class AuthModule { }
