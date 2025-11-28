import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class TenantGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        // If no user (public route), allow
        if (!user) {
            return true;
        }

        // Check if user has organization
        if (!user.orgId) {
            // If user is authenticated but has no org, they might be in onboarding
            // Allow access but don't set organizationId
            return true;
        }

        // Inject organizationId into request for use in services
        request.organizationId = user.orgId;

        return true;
    }
}
