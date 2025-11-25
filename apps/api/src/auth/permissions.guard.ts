import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from './permissions.decorator';
import { RoleService } from '../user-admin/role.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(private reflector: Reflector, private roleService: RoleService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredPermissions) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest();
        if (!user) {
            return false;
        }

        // Fetch user roles and their scopes
        // Optimization: In a real app, we might cache this or include scopes in the JWT
        const userRoles = await this.roleService.getUserRoles(user.userId);

        const userScopes = new Set<string>();
        userRoles.forEach(ur => {
            ur.role.scopes.forEach(scope => userScopes.add(scope));
        });

        // Check if user has ALL required permissions (or ANY? Usually ANY for roles, ALL for scopes? 
        // Let's assume ANY of the required permissions is enough if we list multiple, 
        // OR we can define it as "Must have ALL". 
        // For simplicity, let's say if I require ['project.create'], I need that.
        // If I require ['project.create', 'project.admin'], usually it means ONE OF THEM.
        // But if I want strict granular control, maybe ALL.
        // Let's go with: User must have ALL required permissions.

        const hasAllPermissions = requiredPermissions.every(permission => userScopes.has(permission));

        if (!hasAllPermissions) {
            throw new ForbiddenException('Insufficient permissions');
        }

        return true;
    }
}
