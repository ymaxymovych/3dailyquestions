import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

/**
 * ActiveUserGuard
 * 
 * Ensures that only users with ACTIVE status can access protected routes.
 * PENDING users will be blocked with a ForbiddenException.
 * BLOCKED users will also be blocked.
 */
@Injectable()
export class ActiveUserGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) {
            throw new ForbiddenException('User not authenticated');
        }

        if (user.status === 'PENDING') {
            throw new ForbiddenException('Your account is pending approval. Please wait for an administrator to approve your request.');
        }

        if (user.status === 'BLOCKED') {
            throw new ForbiddenException('Your account has been blocked. Please contact support.');
        }

        return true;
    }
}
