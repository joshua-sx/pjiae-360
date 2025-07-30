export interface Person {
  division?: string;
  department?: string;
}

export interface OrgStructureItem {
  id: string;
  name: string;
  type: 'division' | 'department';
  rank: number;
}

/**
 * Cleans and normalizes division/department names by removing common suffixes
 * and standardizing the format
 */
const cleanOrganizationalName = (name: string): string => {
  if (!name || typeof name !== 'string') return '';
  
  // Trim whitespace and normalize
  let cleaned = name.trim();
  
  // Remove common suffixes (case-insensitive)
  const suffixesToRemove = [
    /\s+division$/i,
    /\s+department$/i,
    /\s+dept\.?$/i,
    /\s+div\.?$/i
  ];
  
  for (const suffix of suffixesToRemove) {
    cleaned = cleaned.replace(suffix, '');
  }
  
  // Convert to Title Case for consistency
  cleaned = cleaned
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .trim();
  
  return cleaned;
};

/**
 * Extracts unique divisions and departments from a list of people/employees
 * and returns them as organizational structure items
 */
export const extractOrgStructureFromPeople = (people: Person[]): OrgStructureItem[] => {
  const divisions = new Set<string>();
  const departments = new Set<string>();

  people.forEach(person => {
    // Clean and normalize division names
    if (person.division && typeof person.division === 'string' && person.division.trim().length > 0) {
      const cleanedDivision = cleanOrganizationalName(person.division);
      if (cleanedDivision.length > 0) {
        divisions.add(cleanedDivision);
      }
    }
    
    // Clean and normalize department names
    if (person.department && typeof person.department === 'string' && person.department.trim().length > 0) {
      const cleanedDepartment = cleanOrganizationalName(person.department);
      if (cleanedDepartment.length > 0) {
        departments.add(cleanedDepartment);
      }
    }
  });

  const orgStructure: OrgStructureItem[] = [];

  // Add divisions first
  Array.from(divisions).forEach(name => {
    orgStructure.push({
      id: crypto.randomUUID(),
      name,
      type: 'division',
      rank: orgStructure.length + 1
    });
  });

  // Add departments after divisions
  Array.from(departments).forEach(name => {
    orgStructure.push({
      id: crypto.randomUUID(),
      name,
      type: 'department',
      rank: orgStructure.length + 1
    });
  });

  return orgStructure;
};