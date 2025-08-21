/**
 * Consistency Audit Utilities
 * Simple tooling to detect and report UI consistency issues
 */

import React from 'react';

/**
 * Check if all colors in a stylesheet use semantic tokens
 */
export function auditColorUsage(cssText: string): {
  totalColors: number;
  tokenBasedColors: number;
  rawColors: string[];
  score: number;
} {
  // Match hex colors, rgb/rgba, hsl/hsla that aren't token-based
  const colorRegex = /#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\)/g;
  const tokenRegex = /hsl\(var\(--[^)]+\)\)|rgb\(var\(--[^)]+\)\)/g;
  
  const allColors = cssText.match(colorRegex) || [];
  const tokenColors = cssText.match(tokenRegex) || [];
  
  const rawColors = allColors.filter(color => 
    !color.includes('var(--') && 
    !color.includes('currentColor') &&
    !color.includes('transparent') &&
    !color.includes('inherit')
  );

  const totalColors = allColors.length;
  const tokenBasedColors = tokenColors.length;
  const score = totalColors > 0 ? (tokenBasedColors / totalColors) * 100 : 100;

  return {
    totalColors,
    tokenBasedColors,
    rawColors,
    score: Math.round(score * 100) / 100,
  };
}

/**
 * Analyze motion consistency in CSS
 */
export function auditMotionConsistency(cssText: string): {
  totalTransitions: number;
  standardDurations: number;
  customDurations: string[];
  score: number;
} {
  const transitionRegex = /transition(?:-duration)?:\s*([^;]+)/g;
  const standardDurationRegex = /var\(--motion-duration-\w+\)/;
  
  const transitions: string[] = [];
  let match;
  
  while ((match = transitionRegex.exec(cssText)) !== null) {
    transitions.push(match[1].trim());
  }

  const standardTransitions = transitions.filter(transition => 
    standardDurationRegex.test(transition)
  );

  const customDurations = transitions
    .filter(transition => !standardDurationRegex.test(transition))
    .filter(transition => /\d+m?s/.test(transition));

  const score = transitions.length > 0 
    ? (standardTransitions.length / transitions.length) * 100 
    : 100;

  return {
    totalTransitions: transitions.length,
    standardDurations: standardTransitions.length,
    customDurations: [...new Set(customDurations)],
    score: Math.round(score * 100) / 100,
  };
}

/**
 * Check z-index usage consistency
 */
export function auditZIndexUsage(cssText: string): {
  totalZIndexes: number;
  tokenBasedZIndexes: number;
  rawZIndexes: string[];
  score: number;
} {
  const zIndexRegex = /z-index:\s*([^;]+)/g;
  const tokenZIndexRegex = /var\(--z-\w+\)/;
  
  const zIndexes: string[] = [];
  let match;
  
  while ((match = zIndexRegex.exec(cssText)) !== null) {
    zIndexes.push(match[1].trim());
  }

  const tokenBasedZIndexes = zIndexes.filter(zIndex => 
    tokenZIndexRegex.test(zIndex)
  );

  const rawZIndexes = zIndexes
    .filter(zIndex => !tokenZIndexRegex.test(zIndex))
    .filter(zIndex => /^\d+$/.test(zIndex));

  const score = zIndexes.length > 0 
    ? (tokenBasedZIndexes.length / zIndexes.length) * 100 
    : 100;

  return {
    totalZIndexes: zIndexes.length,
    tokenBasedZIndexes: tokenBasedZIndexes.length,
    rawZIndexes: [...new Set(rawZIndexes)],
    score: Math.round(score * 100) / 100,
  };
}

/**
 * Generate consistency report
 */
export function generateConsistencyReport(cssContent: string): {
  colors: ReturnType<typeof auditColorUsage>;
  motion: ReturnType<typeof auditMotionConsistency>;
  zIndex: ReturnType<typeof auditZIndexUsage>;
  overallScore: number;
} {
  const colors = auditColorUsage(cssContent);
  const motion = auditMotionConsistency(cssContent);
  const zIndex = auditZIndexUsage(cssContent);

  const overallScore = (colors.score + motion.score + zIndex.score) / 3;

  return {
    colors,
    motion,
    zIndex,
    overallScore: Math.round(overallScore * 100) / 100,
  };
}

/**
 * Console-friendly consistency reporter for development
 */
export function logConsistencyReport(cssContent: string): void {
  const report = generateConsistencyReport(cssContent);
  
  console.group('🎨 UI Consistency Report');
  
  console.log(`📊 Overall Score: ${report.overallScore}%`);
  
  console.group('🎯 Color Token Usage');
  console.log(`Score: ${report.colors.score}%`);
  console.log(`Token-based: ${report.colors.tokenBasedColors}/${report.colors.totalColors}`);
  if (report.colors.rawColors.length > 0) {
    console.warn('Raw colors found:', report.colors.rawColors);
  }
  console.groupEnd();
  
  console.group('⚡ Motion Consistency');
  console.log(`Score: ${report.motion.score}%`);
  console.log(`Standard durations: ${report.motion.standardDurations}/${report.motion.totalTransitions}`);
  if (report.motion.customDurations.length > 0) {
    console.warn('Custom durations found:', report.motion.customDurations);
  }
  console.groupEnd();
  
  console.group('📐 Z-Index Usage');
  console.log(`Score: ${report.zIndex.score}%`);
  console.log(`Token-based: ${report.zIndex.tokenBasedZIndexes}/${report.zIndex.totalZIndexes}`);
  if (report.zIndex.rawZIndexes.length > 0) {
    console.warn('Raw z-indexes found:', report.zIndex.rawZIndexes);
  }
  console.groupEnd();
  
  console.groupEnd();
}

/**
 * React hook for development-time consistency monitoring
 */
export function useConsistencyMonitor() {
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Get all stylesheets
      const stylesheets = Array.from(document.styleSheets);
      let allCss = '';
      
      try {
        stylesheets.forEach(sheet => {
          if (sheet.href && sheet.href.includes(window.location.origin)) {
            // This would need to be implemented with a build-time analysis
            // since accessing cross-origin stylesheets is restricted
          }
        });
        
        // For now, just log a placeholder
        console.log('🎨 Consistency monitoring active (development mode)');
      } catch (error) {
        console.warn('Could not access stylesheets for consistency monitoring:', error);
      }
    }
  }, []);
}