import { Resend } from "https://esm.sh/resend@2.0.0";
import type { ImportRequest } from "./types.ts";
import { logger } from "../_shared/logger.ts";

// Initialize Resend with graceful handling of missing API key
const resendApiKey = Deno.env.get("RESEND_API_KEY");
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export interface EmailContext {
  orgName: string;
  originUrl?: string;
}

export interface EmailResult {
  success: boolean;
  error?: string;
}

// Email templates
const createWelcomeEmailHTML = (
  person: ImportRequest["people"][0],
  context: EmailContext,
  verificationToken?: string | null
): string => {
  const { orgName, originUrl } = context;
  const verificationUrl = verificationToken
    ? `${originUrl || "http://localhost:3000"}/verify-email?token=${verificationToken}`
    : null;

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
        Welcome to ${orgName}!
      </h1>
      
      <p>Hi ${person.firstName},</p>
      
      <p>You've been added to the ${orgName} performance management system. Your account has been created with the following details:</p>
      
      <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <strong>Your Details:</strong><br>
        Name: ${person.firstName} ${person.lastName}<br>
        Email: ${person.email}<br>
        Job Title: ${person.jobTitle}<br>
        ${person.department ? `Department: ${person.department}<br>` : ""}
        ${person.division ? `Division: ${person.division}<br>` : ""}
      </div>
      
      ${
        verificationUrl
          ? `
        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #856404; margin-top: 0;">🔐 Important: Verify Your Email Address</h3>
          <p style="color: #856404;">For security purposes, you must verify your email address before accessing the platform.</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">
               Verify Email Address
            </a>
          </div>
          <p style="font-size: 14px; color: #856404;">
            This verification link will expire in 24 hours. If you didn't request this, please ignore this email.
          </p>
        </div>
      `
          : `
        <p>To access your account, please check your email for a sign-in link from Supabase, or visit our platform and use the "Forgot Password" option to set up your password.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${originUrl || "http://localhost:3000"}" 
             style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Access Platform
          </a>
        </div>
      `
      }
      
      <p>If you have any questions, please contact your administrator.</p>
      
      <p>Best regards,<br>The ${orgName} Team</p>
      
      <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
      <p style="color: #666; font-size: 12px;">
        This is an automated security email. Please do not reply.<br>
        If you didn't expect this email, please contact your administrator immediately.
      </p>
    </div>
  `;
};

// Email sending service
export class EmailService {
  private isConfigured: boolean;

  constructor() {
    this.isConfigured = !!resend;
  }

  async sendWelcomeEmail(
    person: ImportRequest["people"][0],
    context: EmailContext,
    verificationToken?: string | null
  ): Promise<EmailResult> {
    if (!this.isConfigured) {
      logger.info(`Skipping email for ${person.email} - Resend not configured`);
      return { success: true }; // Don't fail import if email isn't configured
    }

    try {
      const emailHTML = createWelcomeEmailHTML(person, context, verificationToken);
      const subject = verificationToken
        ? `Welcome to ${context.orgName} - Verify Your Email`
        : `Welcome to ${context.orgName} - Complete Your Account Setup`;

      await resend!.emails.send({
        from: "Team <onboarding@resend.dev>",
        to: [person.email],
        subject: subject,
        html: emailHTML,
      });

      logger.info(`Invitation email sent to ${person.email}`);
      return { success: true };
    } catch (error) {
      console.error(`Error sending email to ${person.email}:`, error);
      return { success: false, error: error.message };
    }
  }

  async sendBatchWelcomeEmails(
    people: ImportRequest["people"],
    context: EmailContext,
    verificationTokens?: Record<string, string | null>
  ): Promise<Array<{ email: string; result: EmailResult }>> {
    const results: Array<{ email: string; result: EmailResult }> = [];

    // Send emails sequentially to avoid rate limiting
    for (const person of people) {
      const verificationToken = verificationTokens?.[person.email] || null;
      const result = await this.sendWelcomeEmail(person, context, verificationToken);
      results.push({ email: person.email, result });

      // Small delay between emails to be respectful to email service
      if (people.length > 10) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    return results;
  }

  async sendErrorNotification(
    adminEmail: string,
    orgName: string,
    errorDetails: {
      totalAttempted: number;
      successful: number;
      failed: number;
      errors: Array<{ email: string; error: string }>;
    }
  ): Promise<EmailResult> {
    if (!this.isConfigured) {
      return { success: true };
    }

    try {
      const errorHTML = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #dc3545;">Import Status Report</h1>
          
          <p>Your employee import for ${orgName} has completed with the following results:</p>
          
          <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <strong>Summary:</strong><br>
            Total Attempted: ${errorDetails.totalAttempted}<br>
            Successful: ${errorDetails.successful}<br>
            Failed: ${errorDetails.failed}
          </div>
          
          ${
            errorDetails.errors.length > 0
              ? `
            <h3>Errors:</h3>
            <ul>
              ${errorDetails.errors
                .map(
                  (error) => `
                <li><strong>${error.email}:</strong> ${error.error}</li>
              `
                )
                .join("")}
            </ul>
          `
              : ""
          }
          
          <p>Please review the failed imports and contact support if you need assistance.</p>
        </div>
      `;

      await resend!.emails.send({
        from: "System <onboarding@resend.dev>",
        to: [adminEmail],
        subject: `Import Status Report - ${orgName}`,
        html: errorHTML,
      });

      return { success: true };
    } catch (error) {
      console.error("Error sending admin notification email:", error);
      return { success: false, error: error.message };
    }
  }

  isEmailConfigured(): boolean {
    return this.isConfigured;
  }
}

// Export singleton instance
export const emailService = new EmailService();
