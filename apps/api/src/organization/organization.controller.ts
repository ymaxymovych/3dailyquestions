import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto, UpdateOrganizationDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { TenantGuard } from '../common/guards/tenant.guard';

@Controller('organizations')
export class OrganizationController {
    constructor(private readonly organizationService: OrganizationService) { }

    @Post()
    @UseGuards(AuthGuard('jwt')) // Only auth needed for creation (if we allow users to create orgs)
    create(@Body() createOrganizationDto: CreateOrganizationDto) {
        return this.organizationService.create(createOrganizationDto);
    }

    @Get()
    @UseGuards(AuthGuard('jwt'), TenantGuard) // Protect list
    findAll() {
        return this.organizationService.findAll();
    }

    @Get(':id')
    @UseGuards(AuthGuard('jwt'), TenantGuard) // Protect detail
    findOne(@Param('id') id: string) {
        return this.organizationService.findById(id);
    }

    @Patch(':id')
    @UseGuards(AuthGuard('jwt'), TenantGuard) // Protect update
    update(@Param('id') id: string, @Body() updateOrganizationDto: UpdateOrganizationDto) {
        return this.organizationService.update(id, updateOrganizationDto);
    }

    @Delete(':id')
    @UseGuards(AuthGuard('jwt'), TenantGuard) // Protect delete
    remove(@Param('id') id: string) {
        return this.organizationService.remove(id);
    }
}
