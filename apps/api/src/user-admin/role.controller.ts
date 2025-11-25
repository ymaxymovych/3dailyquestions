import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { RoleService } from './role.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('user-admin/roles')
@UseGuards(JwtAuthGuard)
export class RoleController {
    constructor(private readonly roleService: RoleService) { }

    @Get()
    async getAllRoles() {
        return this.roleService.getAllRoles();
    }

    @Post()
    async createRole(@Body() body: any) {
        return this.roleService.createRole(body);
    }

    @Put(':id')
    async updateRole(@Param('id') id: string, @Body() body: any) {
        return this.roleService.updateRole(id, body);
    }

    @Get('user/:userId')
    async getUserRoles(@Param('userId') userId: string) {
        return this.roleService.getUserRoles(userId);
    }

    @Post('assign')
    async assignRole(@Request() req: any, @Body() body: { userId: string; roleId: string }) {
        // TODO: Check if req.user has permission to assign roles
        return this.roleService.assignRole(body.userId, body.roleId, req.user.userId);
    }

    @Delete('revoke')
    async revokeRole(@Body() body: { userId: string; roleId: string }) {
        // TODO: Check permissions
        return this.roleService.revokeRole(body.userId, body.roleId);
    }
}
