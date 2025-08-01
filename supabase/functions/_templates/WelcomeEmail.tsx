import {
  Heading,
  Text,
  Hr,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'
import { EmailLayout } from './base/EmailLayout.tsx'
import { Button } from './base/Button.tsx'
import { Card } from './base/Card.tsx'

interface WelcomeEmailProps {
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  department?: string;
  division?: string;
  orgName: string;
  verificationUrl?: string;
  loginUrl: string;
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

export const WelcomeEmail = ({
  firstName,
  lastName,
  email,
  jobTitle,
  department,
  division,
  orgName,
  verificationUrl,
  loginUrl,
}: WelcomeEmailProps) => (
  <EmailLayout preview={`Welcome to ${orgName} - Get Started Today`}>
    <Heading style={h1}>Welcome to {orgName}!</Heading>
    
    <Text style={text}>Hi {firstName},</Text>
    
    <Text style={text}>
      We're excited to have you join our team! Your account has been created in our 
      performance management system, where you'll be able to manage your goals, 
      participate in performance reviews, and track your professional development.
    </Text>

    <Card variant="info">
      <Heading style={h3}>Your Account Details</Heading>
      <div style={detailsGrid}>
        <div style={detailRow}>
          <strong>Name:</strong> {firstName} {lastName}
        </div>
        <div style={detailRow}>
          <strong>Email:</strong> {email}
        </div>
        <div style={detailRow}>
          <strong>Job Title:</strong> {jobTitle}
        </div>
        {department && (
          <div style={detailRow}>
            <strong>Department:</strong> {department}
          </div>
        )}
        {division && (
          <div style={detailRow}>
            <strong>Division:</strong> {division}
          </div>
        )}
      </div>
    </Card>

    {verificationUrl ? (
      <Card variant="warning">
        <Heading style={h3}>🔐 Important: Verify Your Email</Heading>
        <Text style={text}>
          For security purposes, you must verify your email address before accessing the platform.
        </Text>
        <div style={buttonContainer}>
          <Button href={verificationUrl} variant="primary" size="lg">
            Verify Email Address
          </Button>
        </div>
        <Text style={smallText}>
          This verification link will expire in 24 hours. If you didn't request this, 
          please contact your administrator immediately.
        </Text>
      </Card>
    ) : (
      <Card variant="success">
        <Heading style={h3}>🚀 Get Started</Heading>
        <Text style={text}>
          Your account is ready! Click the button below to access the platform and 
          begin setting up your profile.
        </Text>
        <div style={buttonContainer}>
          <Button href={loginUrl} variant="primary" size="lg">
            Access Platform
          </Button>
        </div>
      </Card>
    )}

    <Hr style={hr} />

    <Card>
      <Heading style={h3}>What's Next?</Heading>
      <ul style={list}>
        <li style={listItem}>Complete your profile setup</li>
        <li style={listItem}>Review your initial goals and objectives</li>
        <li style={listItem}>Familiarize yourself with the appraisal process</li>
        <li style={listItem}>Connect with your manager or supervisor</li>
      </ul>
    </Card>

    <Text style={text}>
      If you have any questions or need assistance, please don't hesitate to 
      contact your administrator or manager.
    </Text>

    <Text style={text}>
      Welcome aboard!<br />
      The {orgName} Team
    </Text>
  </EmailLayout>
)

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

const detailsGrid = {
  display: 'block',
}

const detailRow = {
  color: brandColors.dark,
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '8px 0',
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

export default WelcomeEmail