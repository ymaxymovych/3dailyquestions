import { Controller, Get, Param } from '@nestjs/common';
import { RoleArchetypesService } from './role-archetypes.service';

@Controller('role-archetypes')
export class RoleArchetypesController {
  constructor(private readonly roleArchetypesService: RoleArchetypesService) {}

  @Get('departments')
  async getDepartments() {
    return this.roleArchetypesService.getAllDepartments();
  }

  @Get('departments/:code')
  async getDepartmentByCode(@Param('code') code: string) {
    return this.roleArchetypesService.getDepartmentByCode(code);
  }

  @Get('roles/:code')
  async getRoleByCode(@Param('code') code: string) {
    return this.roleArchetypesService.getRoleByCode(code);
  }

  @Get('roles/:code/kpis')
  async getRoleKPIs(@Param('code') code: string) {
    return this.roleArchetypesService.getRoleKPIs(code);
  }
}
