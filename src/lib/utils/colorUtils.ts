/**
 * Color Utility Functions
 * Helpers for working with semantic colors and status indicators
 */

export type SemanticColor = 'success' | 'warning' | 'error' | 'info' | 'primary' | 'neutral';

/**
 * Maps legacy hard-coded colors to semantic color variants
 */
export function mapLegacyColorToSemantic(colorClass: string): SemanticColor {
  if (colorClass.includes('green')) return 'success';
  if (colorClass.includes('blue')) return 'info';
  if (colorClass.includes('purple')) return 'primary';
  if (colorClass.includes('orange') || colorClass.includes('yellow')) return 'warning';
  if (colorClass.includes('red')) return 'error';
  return 'neutral';
}

/**
 * Get status color for common status values
 */
export function getStatusColor(status: string): SemanticColor {
  const normalizedStatus = status.toLowerCase();
  
  // Success states
  if (['active', 'completed', 'success', 'approved', 'published'].includes(normalizedStatus)) {
    return 'success';
  }
  
  // Warning states
  if (['pending', 'draft', 'in_progress', 'review', 'warning'].includes(normalizedStatus)) {
    return 'warning';
  }
  
  // Error states
  if (['failed', 'error', 'rejected', 'cancelled', 'inactive'].includes(normalizedStatus)) {
    return 'error';
  }
  
  // Info states
  if (['info', 'new', 'scheduled'].includes(normalizedStatus)) {
    return 'info';
  }
  
  return 'neutral';
}

/**
 * Get priority color
 */
export function getPriorityColor(priority: string): SemanticColor {
  const normalizedPriority = priority.toLowerCase();
  
  if (['high', 'urgent', 'critical'].includes(normalizedPriority)) {
    return 'error';
  }
  
  if (['medium', 'normal'].includes(normalizedPriority)) {
    return 'warning';
  }
  
  if (['low'].includes(normalizedPriority)) {
    return 'info';
  }
  
  return 'neutral';
}

/**
 * Generate consistent icon color class from semantic color
 */
export function getIconColorClass(variant: SemanticColor): string {
  const colorMap: Record<SemanticColor, string> = {
    success: 'icon-success',
    warning: 'icon-warning',
    error: 'icon-error',
    info: 'icon-info',
    primary: 'icon-primary',
    neutral: 'icon-muted',
  };
  
  return colorMap[variant] || colorMap.neutral;
}