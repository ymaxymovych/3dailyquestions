import { Controller, Get, Post, Param, UseGuards, Request, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { ActiveUserGuard } from '../common/guards/active-user.guard';

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) { }

    @UseGuards(AuthGuard('jwt'), ActiveUserGuard)
    @Get('me')
    getProfile(@Request() req: any) {
        return this.usersService.getProfile(req.user.userId);
    }

    /**
     * Get all pending join requests for the current organization
     * Admin only
     */
    @UseGuards(AuthGuard('jwt'), ActiveUserGuard)
    @Get('pending')
    getPendingUsers(@Request() req: any) {
        return this.usersService.getPendingUsers(req.user.orgId);
    }

    /**
     * Approve a pending user
     * Admin only
     */
    @UseGuards(AuthGuard('jwt'), ActiveUserGuard)
    @Post(':id/approve')
    approveUser(@Param('id') userId: string, @Request() req: any) {
        return this.usersService.approveUser(userId, req.user.orgId);
    }

    /**
     * Reject a pending user (deletes the user)
     * Admin only
     */
    @UseGuards(AuthGuard('jwt'), ActiveUserGuard)
    @Delete(':id/reject')
    rejectUser(@Param('id') userId: string, @Request() req: any) {
        return this.usersService.rejectUser(userId, req.user.orgId);
    }
}
