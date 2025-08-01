import {
  Heading,
  Text,
  Hr,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'
import { EmailLayout } from './base/EmailLayout.tsx'
import { Button } from './base/Button.tsx'
import { Card } from './base/Card.tsx'

interface SystemNotificationEmailProps {
  recipientName: string;
  orgName: string;
  notificationType: 'import_success' | 'import_error' | 'system_alert' | 'maintenance';
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
  details?: {
    totalAttempted?: number;
    successful?: number;
    failed?: number;
    errors?: Array<{ email: string; error: string }>;
  };
}

const brandColors = {
  primary: '#3b82f6',
  primaryLight: '#eff6ff',
  dark: '#1f2937',
  gray: '#6b7280',
  white: '#ffffff',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
}

export const SystemNotificationEmail = ({
  recipientName,
  orgName,
  notificationType,
  title,
  message,
  actionUrl,
  actionText,
  details,
}: SystemNotificationEmailProps) => {
  const getNotificationConfig = () => {
    switch (notificationType) {
      case 'import_success':
        return {
          emoji: '✅',
          variant: 'success' as const,
          preview: 'Employee import completed successfully',
        }
      case 'import_error':
        return {
          emoji: '⚠️',
          variant: 'warning' as const,
          preview: 'Employee import completed with issues',
        }
      case 'system_alert':
        return {
          emoji: '🚨',
          variant: 'danger' as const,
          preview: 'System alert requires attention',
        }
      case 'maintenance':
        return {
          emoji: '🔧',
          variant: 'info' as const,
          preview: 'System maintenance notification',
        }
      default:
        return {
          emoji: '📢',
          variant: 'default' as const,
          preview: 'System notification',
        }
    }
  }

  const config = getNotificationConfig()

  return (
    <EmailLayout preview={config.preview}>
      <Heading style={h1}>{config.emoji} {title}</Heading>
      
      <Text style={text}>Hi {recipientName},</Text>
      
      <Card variant={config.variant}>
        <Text style={text}>{message}</Text>
        
        {details && (details.totalAttempted || details.successful || details.failed) && (
          <div style={summaryContainer}>
            <Heading style={h3}>Import Summary</Heading>
            <div style={statsGrid}>
              {details.totalAttempted && (
                <div style={statItem}>
                  <div style={statValue}>{details.totalAttempted}</div>
                  <div style={statLabel}>Total Attempted</div>
                </div>
              )}
              {details.successful && (
                <div style={statItem}>
                  <div style={statValueSuccess}>{details.successful}</div>
                  <div style={statLabel}>Successful</div>
                </div>
              )}
              {details.failed && (
                <div style={statItem}>
                  <div style={statValueError}>{details.failed}</div>
                  <div style={statLabel}>Failed</div>
                </div>
              )}
            </div>
          </div>
        )}

        {actionUrl && actionText && (
          <div style={buttonContainer}>
            <Button href={actionUrl} variant="primary" size="lg">
              {actionText}
            </Button>
          </div>
        )}
      </Card>

      {details?.errors && details.errors.length > 0 && (
        <Card variant="danger">
          <Heading style={h3}>❌ Import Errors</Heading>
          <Text style={text}>
            The following employees could not be imported. Please review and 
            address these issues:
          </Text>
          <div style={errorList}>
            {details.errors.map((error, index) => (
              <div key={index} style={errorItem}>
                <div style={errorEmail}>{error.email}</div>
                <div style={errorMessage}>{error.error}</div>
              </div>
            ))}
          </div>
          <Text style={smallText}>
            💡 <strong>Tip:</strong> You can try importing these employees again 
            after addressing the issues above.
          </Text>
        </Card>
      )}

      {notificationType === 'import_success' && details?.successful && (
        <Card variant="success">
          <Heading style={h3}>🎉 Next Steps</Heading>
          <ul style={list}>
            <li style={listItem}>Welcome emails have been sent to all new employees</li>
            <li style={listItem}>Users can now log in and complete their profiles</li>
            <li style={listItem}>Consider setting up initial goals and appraisal cycles</li>
            <li style={listItem}>Review role assignments in the admin dashboard</li>
          </ul>
        </Card>
      )}

      <Hr style={hr} />

      <Text style={text}>
        If you need assistance or have questions about this notification, 
        please contact system support.
      </Text>

      <Text style={text}>
        Best regards,<br />
        The {orgName} System Team
      </Text>
    </EmailLayout>
  )
}

// Styles
const h1 = {
  color: brandColors.dark,
  fontSize: '28px',
  fontWeight: 'bold',
  lineHeight: '1.3',
  margin: '0 0 20px 0',
}

const h3 = {
  color: brandColors.dark,
  fontSize: '20px',
  fontWeight: '600',
  lineHeight: '1.4',
  margin: '0 0 16px 0',
}

const text = {
  color: brandColors.dark,
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 16px 0',
}

const smallText = {
  color: brandColors.gray,
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '12px 0 0 0',
}

const summaryContainer = {
  backgroundColor: brandColors.primaryLight,
  padding: '20px',
  borderRadius: '8px',
  margin: '16px 0',
}

const statsGrid = {
  display: 'flex',
  justifyContent: 'space-around',
  flexWrap: 'wrap' as const,
  gap: '16px',
}

const statItem = {
  textAlign: 'center' as const,
  minWidth: '80px',
}

const statValue = {
  fontSize: '32px',
  fontWeight: 'bold',
  color: brandColors.primary,
  margin: '0',
}

const statValueSuccess = {
  fontSize: '32px',
  fontWeight: 'bold',
  color: brandColors.success,
  margin: '0',
}

const statValueError = {
  fontSize: '32px',
  fontWeight: 'bold',
  color: brandColors.danger,
  margin: '0',
}

const statLabel = {
  fontSize: '12px',
  color: brandColors.gray,
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '24px 0',
}

const errorList = {
  backgroundColor: brandColors.white,
  border: `1px solid #fecaca`,
  borderRadius: '6px',
  padding: '16px',
  margin: '16px 0',
}

const errorItem = {
  borderBottom: '1px solid #fee2e2',
  padding: '12px 0',
  marginBottom: '12px',
}

const errorEmail = {
  fontWeight: '600',
  color: brandColors.dark,
  fontSize: '14px',
}

const errorMessage = {
  color: brandColors.danger,
  fontSize: '14px',
  marginTop: '4px',
}

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
}

const list = {
  color: brandColors.dark,
  fontSize: '16px',
  lineHeight: '1.6',
  paddingLeft: '20px',
  margin: '0',
}

const listItem = {
  margin: '8px 0',
}

export default SystemNotificationEmail