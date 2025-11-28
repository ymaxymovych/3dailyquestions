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
        if (!user.organizationId) {
            // If user is authenticated but has no org, they might be in onboarding
            // We can allow or block depending on policy. For now, let's allow but log warning.
            // Or maybe block access to org-specific resources?
            // For now, we just ensure request.organizationId is set if user has it.
            return true;
        }

        // Inject organizationId into request for use in services
        request.organizationId = user.organizationId;

        return true;
    }
}
