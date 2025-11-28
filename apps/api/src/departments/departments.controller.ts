import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { DepartmentsService, CreateDepartmentDto, UpdateDepartmentDto, AssignUserDto } from './departments.service';
import { AuthGuard } from '@nestjs/passport';
import { ActiveUserGuard } from '../common/guards/active-user.guard';
import { TenantGuard } from '../common/guards/tenant.guard';

@Controller('departments')
@UseGuards(AuthGuard('jwt'), ActiveUserGuard, TenantGuard)
export class DepartmentsController {
    constructor(private readonly departmentsService: DepartmentsService) { }

    /**
     * Get all department archetypes (templates)
     */
    @Get('archetypes')
    getArchetypes() {
        return this.departmentsService.getArchetypes();
    }

    /**
     * Get all available users for assignment
     * Must be before :id route
     */
    @Get('users-available')
    getAvailableUsers(@Request() req: any) {
        return this.departmentsService.getAvailableUsers(req.user.orgId);
    }

    /**
     * Get all departments for the current organization
     */
    @Get()
    findAll(@Request() req: any) {
        return this.departmentsService.findAll(req.user.orgId);
    }

    /**
     * Get a single department by ID
     */
    @Get(':id')
    findOne(@Param('id') id: string, @Request() req: any) {
        return this.departmentsService.findOne(id, req.user.orgId);
    }

    /**
     * Create a new department
     */
    @Post()
    create(@Body() dto: CreateDepartmentDto, @Request() req: any) {
        return this.departmentsService.create(req.user.orgId, dto);
    }

    /**
     * Update a department
     */
    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() dto: UpdateDepartmentDto,
        @Request() req: any
    ) {
        return this.departmentsService.update(id, req.user.orgId, dto);
    }

    /**
     * Delete a department
     */
    @Delete(':id')
    remove(@Param('id') id: string, @Request() req: any) {
        return this.departmentsService.remove(id, req.user.orgId);
    }

    /**
     * Assign user to department
     */
    @Post(':id/assign-user')
    assignUser(
        @Param('id') departmentId: string,
        @Body() dto: AssignUserDto,
        @Request() req: any
    ) {
        return this.departmentsService.assignUser(departmentId, req.user.orgId, dto);
    }
}
