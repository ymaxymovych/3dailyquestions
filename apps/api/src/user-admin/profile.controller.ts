import { Controller, Get, Put, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('user-admin/profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
    constructor(private readonly profileService: ProfileService) { }

    @Get()
    async getMyProfile(@Request() req: any) {
        return this.profileService.getProfile(req.user.userId);
    }

    @Put()
    async updateProfile(@Request() req: any, @Body() body: any) {
        return this.profileService.updateProfile(req.user.userId, body);
    }

    @Put('workday')
    async updateWorkday(@Request() req: any, @Body() body: any) {
        return this.profileService.updateWorkday(req.user.userId, body);
    }

    @Post('artifact')
    async addArtifact(@Request() req: any, @Body() body: any) {
        return this.profileService.addArtifact(req.user.userId, body);
    }
}
