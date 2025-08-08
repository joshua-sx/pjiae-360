import { config } from '@/lib/config';

// File validation for CSV uploads
export const validateFileUpload = (file: File): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // File size limit
  if (file.size > config.maxFileUploadSize) {
    errors.push(`File size must be less than ${Math.round(config.maxFileUploadSize / 1024 / 1024)}MB`);
  }
  
  // File type validation
  const allowedTypes = ['text/csv', 'application/vnd.ms-excel'];
  if (!allowedTypes.includes(file.type) && !file.name.endsWith('.csv')) {
    errors.push('Only CSV files are allowed');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Check for malicious content in CSV
export const scanCSVContent = async (content: string): Promise<{ isSafe: boolean; threats: string[] }> => {
  const threats: string[] = [];
  
  // Check for script injection attempts
  const scriptPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /on\w+\s*=/gi,
    /expression\s*\(/gi,
    /=\s*cmd\s*\|/gi, // Command injection
    /=\s*@SUM\(/gi, // Excel formula injection
    /=\s*HYPERLINK\(/gi,
  ];
  
  scriptPatterns.forEach(pattern => {
    if (pattern.test(content)) {
      threats.push('Potential script injection detected');
    }
  });
  
  // Check for suspicious file paths
  if (/\.\.[\/\\]/.test(content)) {
    threats.push('Path traversal attempt detected');
  }
  
  // Check for SQL injection patterns (relaxed for demo)
  const sqlPatterns = [
    /\bunion\s+select\b/gi,
    /\bdrop\s+table\b/gi,
    /\bdelete\s+from\b/gi,
    /\binsert\s+into.*values\s*\(/gi,
  ];
  
  sqlPatterns.forEach(pattern => {
    if (pattern.test(content)) {
      threats.push('Potential SQL injection detected');
    }
  });
  
  return {
    isSafe: threats.length === 0,
    threats
  };
};
