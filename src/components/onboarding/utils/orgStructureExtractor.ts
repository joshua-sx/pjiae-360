
export interface Person {
  division?: string;
  department?: string;
}

export interface OrgStructureItem {
  id: string;
  name: string;
  type: 'division' | 'department';
  rank: number;
  parent?: string; // For departments, this will be the division ID
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
 * and returns them as organizational structure items with inferred hierarchy
 */
export const extractOrgStructureFromPeople = (people: Person[]): OrgStructureItem[] => {
  const divisions = new Map<string, string>(); // normalized -> cleaned name
  const departments = new Map<string, string>(); // normalized -> cleaned name
  const departmentToDivision = new Map<string, string>(); // dept normalized -> division normalized

  // First pass: collect all unique divisions and departments, and infer relationships
  people.forEach(person => {
    let cleanedDivision = '';
    let cleanedDepartment = '';
    
    // Clean and normalize division names
    if (person.division && typeof person.division === 'string' && person.division.trim().length > 0) {
      cleanedDivision = cleanOrganizationalName(person.division);
      if (cleanedDivision.length > 0) {
        const normalizedDiv = cleanedDivision.toLowerCase().trim();
        divisions.set(normalizedDiv, cleanedDivision);
      }
    }
    
    // Clean and normalize department names
    if (person.department && typeof person.department === 'string' && person.department.trim().length > 0) {
      cleanedDepartment = cleanOrganizationalName(person.department);
      if (cleanedDepartment.length > 0) {
        const normalizedDept = cleanedDepartment.toLowerCase().trim();
        departments.set(normalizedDept, cleanedDepartment);
        
        // Infer department-to-division relationship
        if (cleanedDivision.length > 0) {
          const normalizedDiv = cleanedDivision.toLowerCase().trim();
          departmentToDivision.set(normalizedDept, normalizedDiv);
        }
      }
    }
  });

  const orgStructure: OrgStructureItem[] = [];
  const divisionIdMap = new Map<string, string>(); // normalized -> id

  // Add divisions first
  Array.from(divisions.entries()).forEach(([normalizedName, cleanedName]) => {
    const divisionId = crypto.randomUUID();
    divisionIdMap.set(normalizedName, divisionId);
    orgStructure.push({
      id: divisionId,
      name: cleanedName,
      type: 'division',
      rank: orgStructure.length + 1
    });
  });

  // Add departments after divisions, with parent references
  Array.from(departments.entries()).forEach(([normalizedName, cleanedName]) => {
    const parentDivisionNormalized = departmentToDivision.get(normalizedName);
    const parentDivisionId = parentDivisionNormalized ? divisionIdMap.get(parentDivisionNormalized) : undefined;
    
    orgStructure.push({
      id: crypto.randomUUID(),
      name: cleanedName,
      type: 'department',
      rank: orgStructure.length + 1,
      parent: parentDivisionId
    });
  });

  return orgStructure;
};
