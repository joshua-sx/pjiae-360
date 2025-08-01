import { Section } from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  padding?: 'sm' | 'md' | 'lg';
}

const brandColors = {
  primary: '#3b82f6',
  primaryLight: '#eff6ff',
  dark: '#1f2937',
  gray: '#6b7280',
  white: '#ffffff',
  success: '#10b981',
  successLight: '#ecfdf5',
  warning: '#f59e0b',
  warningLight: '#fffbeb',
  danger: '#ef4444',
  dangerLight: '#fef2f2',
}

export const Card = ({ 
  children, 
  variant = 'default',
  padding = 'md'
}: CardProps) => {
  const getCardStyles = () => {
    const baseStyles = {
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      margin: '20px 0',
    }

    const paddingStyles = {
      sm: { padding: '16px' },
      md: { padding: '24px' },
      lg: { padding: '32px' },
    }

    const variantStyles = {
      default: {
        backgroundColor: brandColors.white,
        borderColor: '#e5e7eb',
      },
      success: {
        backgroundColor: brandColors.successLight,
        borderColor: brandColors.success,
        borderWidth: '2px',
      },
      warning: {
        backgroundColor: brandColors.warningLight,
        borderColor: brandColors.warning,
        borderWidth: '2px',
      },
      danger: {
        backgroundColor: brandColors.dangerLight,
        borderColor: brandColors.danger,
        borderWidth: '2px',
      },
      info: {
        backgroundColor: brandColors.primaryLight,
        borderColor: brandColors.primary,
        borderWidth: '2px',
      },
    }

    return {
      ...baseStyles,
      ...paddingStyles[padding],
      ...variantStyles[variant],
    }
  }

  return (
    <Section style={getCardStyles()}>
      {children}
    </Section>
  )
}

export default Card