import { useState, useEffect } from 'react';

const commonDomains = [
  'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com',
  'protonmail.com', 'aol.com', 'live.com', 'msn.com', 'me.com'
];

export function useEmailSuggestions(email: string) {
  const [suggestion, setSuggestion] = useState<string>('');

  useEffect(() => {
    if (!email || !email.includes('@')) {
      setSuggestion('');
      return;
    }

    const [localPart, domain] = email.split('@');
    if (!domain || domain.length < 2) {
      setSuggestion('');
      return;
    }

    // Find closest matching domain
    const suggestion = findClosestDomain(domain);
    if (suggestion && suggestion !== domain) {
      setSuggestion(`${localPart}@${suggestion}`);
    } else {
      setSuggestion('');
    }
  }, [email]);

  const applySuggestion = () => {
    return suggestion;
  };

  return { suggestion, applySuggestion };
}

function findClosestDomain(inputDomain: string): string | null {
  const input = inputDomain.toLowerCase();
  
  // Exact match
  if (commonDomains.includes(input)) {
    return null;
  }

  // Find similar domains using simple edit distance
  let bestMatch = '';
  let bestScore = Infinity;
  
  for (const domain of commonDomains) {
    const score = calculateEditDistance(input, domain);
    if (score < bestScore && score <= 2) { // Max 2 character differences
      bestScore = score;
      bestMatch = domain;
    }
  }
  
  return bestScore <= 2 ? bestMatch : null;
}

function calculateEditDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = Array(a.length + 1).fill(null).map(() => Array(b.length + 1).fill(null));

  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,     // deletion
        matrix[i][j - 1] + 1,     // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[a.length][b.length];
}