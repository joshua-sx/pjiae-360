import {
  Heading,
  Text,
  Hr,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'
import { EmailLayout } from './base/EmailLayout.tsx'
import { Button } from './base/Button.tsx'
import { Card } from './base/Card.tsx'

interface AppraisalNotificationEmailProps {
  firstName: string;
  orgName: string;
  notificationType: 'reminder' | 'deadline' | 'completed' | 'assigned';
  appraisalTitle: string;
  dueDate?: string;
  actionUrl: string;
  message?: string;
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

export const AppraisalNotificationEmail = ({
  firstName,
  orgName,
  notificationType,
  appraisalTitle,
  dueDate,
  actionUrl,
  message,
}: AppraisalNotificationEmailProps) => {
  const getNotificationConfig = () => {
    switch (notificationType) {
      case 'reminder':
        return {
          emoji: '⏰',
          title: 'Appraisal Reminder',
          variant: 'warning' as const,
          buttonText: 'Continue Appraisal',
          preview: `Reminder: ${appraisalTitle} needs your attention`,
        }
      case 'deadline':
        return {
          emoji: '🚨',
          title: 'Appraisal Deadline Approaching',
          variant: 'danger' as const,
          buttonText: 'Complete Now',
          preview: `Urgent: ${appraisalTitle} deadline approaching`,
        }
      case 'completed':
        return {
          emoji: '✅',
          title: 'Appraisal Completed',
          variant: 'success' as const,
          buttonText: 'View Results',
          preview: `Great job! ${appraisalTitle} completed successfully`,
        }
      case 'assigned':
        return {
          emoji: '📋',
          title: 'New Appraisal Assigned',
          variant: 'info' as const,
          buttonText: 'Get Started',
          preview: `New appraisal assigned: ${appraisalTitle}`,
        }
      default:
        return {
          emoji: '📊',
          title: 'Appraisal Update',
          variant: 'default' as const,
          buttonText: 'View Appraisal',
          preview: `Update on ${appraisalTitle}`,
        }
    }
  }

  const config = getNotificationConfig()

  return (
    <EmailLayout preview={config.preview}>
      <Heading style={h1}>{config.emoji} {config.title}</Heading>
      
      <Text style={text}>Hi {firstName},</Text>
      
      <Card variant={config.variant}>
        <Heading style={h3}>{appraisalTitle}</Heading>
        
        {message && (
          <Text style={text}>{message}</Text>
        )}
        
        {dueDate && (
          <div style={dueDateContainer}>
            <Text style={dueDateLabel}>Due Date:</Text>
            <Text style={dueDateValue}>{dueDate}</Text>
          </div>
        )}
        
        <div style={buttonContainer}>
          <Button 
            href={actionUrl} 
            variant={notificationType === 'deadline' ? 'danger' : 'primary'} 
            size="lg"
          >
            {config.buttonText}
          </Button>
        </div>
      </Card>

      {notificationType === 'reminder' && (
        <Card>
          <Heading style={h3}>Quick Tips</Heading>
          <ul style={list}>
            <li style={listItem}>Review your goals and achievements from this period</li>
            <li style={listItem}>Gather feedback from colleagues and stakeholders</li>
            <li style={listItem}>Prepare examples of your key contributions</li>
            <li style={listItem}>Think about areas for future development</li>
          </ul>
        </Card>
      )}

      {notificationType === 'deadline' && (
        <Card variant="warning">
          <Heading style={h3}>⚠️ Action Required</Heading>
          <Text style={text}>
            This appraisal has a deadline approaching. Please complete it as soon as possible 
            to ensure your review process stays on track.
          </Text>
        </Card>
      )}

      {notificationType === 'completed' && (
        <Card variant="success">
          <Heading style={h3}>🎉 Well Done!</Heading>
          <Text style={text}>
            Thank you for completing your appraisal. Your responses have been saved and 
            your manager will review them shortly. You'll be notified when the review 
            process moves to the next stage.
          </Text>
        </Card>
      )}

      <Hr style={hr} />

      <Text style={text}>
        If you have any questions about this appraisal or need technical assistance, 
        please contact your manager or system administrator.
      </Text>

      <Text style={text}>
        Best regards,<br />
        The {orgName} Team
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

const dueDateContainer = {
  backgroundColor: brandColors.primaryLight,
  padding: '16px',
  borderRadius: '6px',
  margin: '16px 0',
  textAlign: 'center' as const,
}

const dueDateLabel = {
  color: brandColors.gray,
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 4px 0',
}

const dueDateValue = {
  color: brandColors.dark,
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '24px 0',
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

export default AppraisalNotificationEmail