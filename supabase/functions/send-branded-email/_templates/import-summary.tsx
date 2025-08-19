import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Section,
  Button,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface ImportSummaryEmailProps {
  adminName: string
  companyName: string
  totalRecords: number
  successfulRecords: number
  failedRecords: number
  dashboardUrl: string
  hasErrors: boolean
}

export const ImportSummaryEmail = ({
  adminName,
  companyName,
  totalRecords,
  successfulRecords,
  failedRecords,
  dashboardUrl,
  hasErrors,
}: ImportSummaryEmailProps) => (
  <Html>
    <Head />
    <Preview>Employee import completed for {companyName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Import Complete</Heading>
        
        <Text style={text}>
          Hi {adminName},
        </Text>
        
        <Text style={text}>
          Your employee import for {companyName} has finished processing.
        </Text>

        <Section style={statsContainer}>
          <Text style={statsTitle}>Import Summary</Text>
          <Text style={statItem}>📊 Total Records: {totalRecords}</Text>
          <Text style={statItem}>✅ Successfully Imported: {successfulRecords}</Text>
          {failedRecords > 0 && (
            <Text style={statItemError}>❌ Failed: {failedRecords}</Text>
          )}
        </Section>
        
        {hasErrors ? (
          <Text style={text}>
            Some records could not be imported. Please review the detailed error report 
            in your admin dashboard and correct any issues before re-importing.
          </Text>
        ) : (
          <Text style={text}>
            All employees were successfully imported! You can now send invitations 
            to your team members from the admin dashboard.
          </Text>
        )}

        <Section style={buttonContainer}>
          <Button style={button} href={dashboardUrl}>
            View Dashboard
          </Button>
        </Section>
        
        <Text style={footer}>
          Best regards,<br />
          The {companyName} Team
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ImportSummaryEmail

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

const statsContainer = {
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  margin: '24px 40px',
  padding: '20px',
}

const statsTitle = {
  color: '#333',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 16px 0',
}

const statItem = {
  color: '#333',
  fontSize: '14px',
  margin: '8px 0',
}

const statItemError = {
  color: '#dc2626',
  fontSize: '14px',
  margin: '8px 0',
  fontWeight: '500',
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

const footer = {
  color: '#898989',
  fontSize: '12px',
  lineHeight: '22px',
  margin: '32px 0',
  padding: '0 40px',
}