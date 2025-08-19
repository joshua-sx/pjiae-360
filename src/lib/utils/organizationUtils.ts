interface CleaningConfig {
  suffixesToRemove?: RegExp[];
  caseTransform?: 'title' | 'upper' | 'lower' | 'none';
}

const DEFAULT_SUFFIXES = [
  /\s+division$/i,
  /\s+department$/i,
  /\s+dept\.?$/i,
  /\s+div\.?$/i
];

export function cleanOrganizationalName(
  name: string, 
  config: CleaningConfig = {}
): string {
  if (!name || typeof name !== 'string') {
    return '';
  }

  const suffixes = config.suffixesToRemove || DEFAULT_SUFFIXES;
  let cleanedName = name.trim();
  
  // Remove matching suffixes
  for (const suffix of suffixes) {
    cleanedName = cleanedName.replace(suffix, '');
  }
  
  // Apply case transformation
  switch (config.caseTransform) {
    case 'title':
      cleanedName = cleanedName.replace(/\w\S*/g, (txt) => 
        txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
      break;
    case 'upper':
      cleanedName = cleanedName.toUpperCase();
      break;
    case 'lower':
      cleanedName = cleanedName.toLowerCase();
      break;
    case 'none':
    default:
      // No transformation
      break;
  }
  
  return cleanedName.trim();
}

export function normalizeText(text: string): string {
  return text.toLowerCase().trim().replace(/\s+/g, '_');
}

export function generateOrganizationId(name: string): string {
  return normalizeText(cleanOrganizationalName(name));
}