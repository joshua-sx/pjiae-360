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
 * Extracts unique divisions and departments from a list of people/employees
 * and returns them as organizational structure items
 */
export const extractOrgStructureFromPeople = (people: Person[]): OrgStructureItem[] => {
  const divisions = new Set<string>();
  const departments = new Set<string>();

  people.forEach(person => {
    // Ensure we only add non-empty, meaningful values
    if (person.division && typeof person.division === 'string' && person.division.trim().length > 0) {
      divisions.add(person.division.trim());
    }
    if (person.department && typeof person.department === 'string' && person.department.trim().length > 0) {
      departments.add(person.department.trim());
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