import { Injectable } from '@nestjs/common';

/**
 * Email Service Stub
 * 
 * This is a temporary implementation that logs emails to console.
 * TODO: Replace with real email service (SendGrid, Resend, AWS SES) in Phase 11
 */
@Injectable()
export class EmailService {
    /**
     * Send invite email to user
     * @param to - Recipient email
     * @param inviterName - Name of person who sent invite
     * @param orgName - Organization name
     * @param inviteToken - Invite token for join link
     */
    async sendInviteEmail(to: string, inviterName: string, orgName: string, inviteToken: string) {
        console.log('📧 [EMAIL STUB] Sending invite email:');
        console.log(`   To: ${to}`);
        console.log(`   From: ${inviterName} (${orgName})`);
        console.log(`   Subject: You're invited to join ${orgName}`);
        console.log(`   Body: ${inviterName} invited you to join ${orgName}.`);
        console.log(`   Link: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/join?token=${inviteToken}`);
        console.log('   [This is a stub. Real email will be sent in Phase 11]');

        // TODO: Replace with real email sending
        // await this.emailProvider.send({ to, subject, html, text });
    }

    /**
     * Notify admin about new join request
     * @param adminEmail - Admin email
     * @param userName - Name of user requesting access
     * @param userEmail - Email of user requesting access
     * @param orgName - Organization name
     */
    async sendJoinRequestNotification(adminEmail: string, userName: string, userEmail: string, orgName: string) {
        console.log('📧 [EMAIL STUB] Sending join request notification:');
        console.log(`   To: ${adminEmail}`);
        console.log(`   Subject: New join request for ${orgName}`);
        console.log(`   Body: ${userName} (${userEmail}) requested to join ${orgName}.`);
        console.log(`   Link: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/users`);
        console.log('   [This is a stub. Real email will be sent in Phase 11]');

        // TODO: Replace with real email sending
    }

    /**
     * Notify user that their request was approved
     * @param to - User email
     * @param orgName - Organization name
     */
    async sendRequestApprovedEmail(to: string, orgName: string) {
        console.log('📧 [EMAIL STUB] Sending request approved email:');
        console.log(`   To: ${to}`);
        console.log(`   Subject: Your request to join ${orgName} was approved`);
        console.log(`   Body: Congratulations! You can now access ${orgName}.`);
        console.log(`   Link: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`);
        console.log('   [This is a stub. Real email will be sent in Phase 11]');

        // TODO: Replace with real email sending
    }

    /**
     * Notify user that their request was rejected
     * @param to - User email
     * @param orgName - Organization name
     */
    async sendRequestRejectedEmail(to: string, orgName: string) {
        console.log('📧 [EMAIL STUB] Sending request rejected email:');
        console.log(`   To: ${to}`);
        console.log(`   Subject: Your request to join ${orgName}`);
        console.log(`   Body: Unfortunately, your request to join ${orgName} was not approved.`);
        console.log('   [This is a stub. Real email will be sent in Phase 11]');

        // TODO: Replace with real email sending
    }
    /**
     * Notify manager about help needed
     * @param managerEmail - Manager email
     * @param userName - Employee name
     * @param helpText - Text of the help request
     * @param reportLink - Link to the report
     */
    async sendManagerHelpNotification(managerEmail: string, userName: string, helpText: string, reportLink: string) {
        console.log('📧 [EMAIL STUB] Sending help needed notification:');
        console.log(`   To: ${managerEmail}`);
        console.log(`   Subject: 🚨 Help Needed: ${userName}`);
        console.log(`   Body: ${userName} reported a blocker/help request:`);
        console.log(`   "${helpText}"`);
        console.log(`   Link: ${reportLink}`);
        console.log('   [This is a stub. Real email will be sent in Phase 11]');
    }
}
