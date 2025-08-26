import { Button as ReactEmailButton } from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface ButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

import { brandColors } from './theme.ts'

export const Button = ({ 
  href, 
  children, 
  variant = 'primary',
  size = 'md'
}: ButtonProps) => {
  const getButtonStyles = () => {
    const baseStyles = {
      display: 'inline-block',
      textDecoration: 'none',
      borderRadius: '6px',
      fontWeight: '600',
      textAlign: 'center' as const,
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    }

    const sizeStyles = {
      sm: { padding: '8px 16px', fontSize: '14px' },
      md: { padding: '12px 24px', fontSize: '16px' },
      lg: { padding: '16px 32px', fontSize: '18px' },
    }

    const variantStyles = {
      primary: {
        backgroundColor: brandColors.primary,
        color: brandColors.white,
      },
      secondary: {
        backgroundColor: brandColors.white,
        color: brandColors.primary,
        border: `2px solid ${brandColors.primary}`,
      },
      success: {
        backgroundColor: brandColors.success,
        color: brandColors.white,
      },
      warning: {
        backgroundColor: brandColors.warning,
        color: brandColors.white,
      },
      danger: {
        backgroundColor: brandColors.danger,
        color: brandColors.white,
      },
    }

    return {
      ...baseStyles,
      ...sizeStyles[size],
      ...variantStyles[variant],
    }
  }

  return (
    <ReactEmailButton href={href} style={getButtonStyles()}>
      {children}
    </ReactEmailButton>
  )
}

export default Button