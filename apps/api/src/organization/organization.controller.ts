import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto, UpdateOrganizationDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { TenantGuard } from '../common/guards/tenant.guard';
import { DemoSeederService } from '../seeder/demo-seeder.service';

@Controller('organizations')
export class OrganizationController {
    constructor(
        private readonly organizationService: OrganizationService,
        private readonly demoSeederService: DemoSeederService
    ) { }

    @Post()
    @UseGuards(AuthGuard('jwt'))
    create(@Body() createOrganizationDto: CreateOrganizationDto) {
        return this.organizationService.create(createOrganizationDto);
    }

    @Post('demo')
    @UseGuards(AuthGuard('jwt'))
    createDemo(@Request() req: any) {
        return this.demoSeederService.seedDemoOrg(req.user.userId);
    }

    @Get()
    @UseGuards(AuthGuard('jwt'), TenantGuard)
    findAll() {
        return this.organizationService.findAll();
    }

    @Get('suggested')
    findSuggested(@Query('email') email: string) {
        return this.organizationService.findSuggestedOrgs(email);
    }

    @Get(':id')
    @UseGuards(AuthGuard('jwt'), TenantGuard)
    findOne(@Param('id') id: string) {
        return this.organizationService.findById(id);
    }

    @Patch(':id')
    @UseGuards(AuthGuard('jwt'), TenantGuard)
    update(@Param('id') id: string, @Body() updateOrganizationDto: UpdateOrganizationDto) {
        return this.organizationService.update(id, updateOrganizationDto);
    }

    @Delete(':id')
    @UseGuards(AuthGuard('jwt'), TenantGuard)
    remove(@Param('id') id: string) {
        return this.organizationService.remove(id);
    }

    // --- Invite System ---

    @Post('invite')
    @UseGuards(AuthGuard('jwt'), TenantGuard)
    createInvite(@Request() req: any, @Body() body: { email: string, role?: string }) {
        console.log('DEBUG createInvite:', {
            organizationId: req.organizationId,
            userId: req.user?.userId,
            userOrgId: req.user?.orgId,
            email: body.email
        });
        return this.organizationService.createInvite(req.organizationId, req.user.userId, body.email, body.role);
    }

    @Get('invite/:token')
    validateInvite(@Param('token') token: string) {
        return this.organizationService.validateInvite(token);
    }

    @Post('invite/accept')
    @UseGuards(AuthGuard('jwt'))
    acceptInvite(@Request() req: any, @Body('token') token: string) {
        return this.organizationService.acceptInvite(req.user.userId, token);
    }
}
