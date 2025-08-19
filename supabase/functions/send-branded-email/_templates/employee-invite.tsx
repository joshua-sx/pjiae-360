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
  jobTitle?: string
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
    <Preview>Welcome to {companyName} - Complete your employee setup</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Welcome to {companyName}!</Heading>
        
        <Text style={text}>
          Hi {employeeName},
        </Text>
        
        <Text style={text}>
          {adminName} has invited you to join {companyName} as {jobTitle ? `a ${jobTitle}` : 'an employee'}. 
          To complete your setup and access your employee dashboard, please click the button below:
        </Text>

        <Section style={buttonContainer}>
          <Button style={button} href={inviteUrl}>
            Complete Setup
          </Button>
        </Section>
        
        <Text style={text}>
          Or copy and paste this link in your browser:
        </Text>
        <Text style={link}>{inviteUrl}</Text>
        
        <Text style={footerText}>
          This invitation will expire in 7 days. If you have any questions, 
          please contact {adminName} or your HR department.
        </Text>
        
        <Text style={footer}>
          Best regards,<br />
          The {companyName} Team
        </Text>
      </Container>
    </Body>
  </Html>
)

export default EmployeeInviteEmail

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
}

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
  textAlign: 'center' as const,
}

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
  padding: '0 40px',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#007ee6',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
}

const link = {
  color: '#007ee6',
  fontSize: '14px',
  textDecoration: 'underline',
  margin: '16px 0',
  padding: '0 40px',
  wordBreak: 'break-all' as const,
}

const footerText = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '24px 0',
  padding: '0 40px',
}

const footer = {
  color: '#898989',
  fontSize: '12px',
  lineHeight: '22px',
  margin: '32px 0',
  padding: '0 40px',
}