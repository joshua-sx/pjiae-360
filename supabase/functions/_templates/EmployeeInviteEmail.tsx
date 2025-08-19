import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Section,
  Button,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface EmployeeInviteEmailProps {
  employeeName: string
  companyName: string
  inviteUrl: string
  adminName: string
  jobTitle: string
}

export const EmployeeInviteEmail = ({
  employeeName,
  companyName,
  inviteUrl,
  adminName,
  jobTitle,
}: EmployeeInviteEmailProps) => (
  <Html>
    <Head />
    <Preview>Welcome to {companyName} - Complete your setup</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Welcome to {companyName}!</Heading>
        
        <Text style={text}>Hi {employeeName},</Text>
        
        <Text style={text}>
          {adminName} has invited you to join {companyName} as a {jobTitle}. 
          We're excited to have you on our team!
        </Text>
        
        <Section style={infoBox}>
          <Text style={infoTitle}>Your Details:</Text>
          <Text style={infoText}>
            <strong>Name:</strong> {employeeName}<br />
            <strong>Position:</strong> {jobTitle}<br />
            <strong>Company:</strong> {companyName}
          </Text>
        </Section>
        
        <Section style={buttonContainer}>
          <Button href={inviteUrl} style={button}>
            Complete Your Setup
          </Button>
        </Section>
        
        <Text style={text}>
          This invitation link will expire in 7 days. If you have any questions, 
          please contact {adminName} or your administrator.
        </Text>
        
        <Text style={footer}>
          Best regards,<br />
          The {companyName} Team
        </Text>
        
        <Text style={disclaimer}>
          This is an automated email. If you didn't expect this invitation, 
          please contact your administrator.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default EmployeeInviteEmail

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '560px',
}

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
  lineHeight: '42px',
}

const text = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '16px 0',
}

const infoBox = {
  backgroundColor: '#f8f9fa',
  border: '1px solid #e9ecef',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
}

const infoTitle = {
  color: '#333',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
}

const infoText = {
  color: '#495057',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#007bff',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
}

const footer = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '32px 0 16px 0',
}

const disclaimer = {
  color: '#6c757d',
  fontSize: '12px',
  lineHeight: '18px',
  margin: '24px 0 0 0',
  paddingTop: '16px',
  borderTop: '1px solid #e9ecef',
}