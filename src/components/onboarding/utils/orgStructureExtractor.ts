
import { normalizeText } from '@/lib/utils/organizationUtils';

export interface OrgStructureItem {
  id: string;
  name: string;
  type: 'division' | 'department';
  parent?: string;
}

export function extractOrgStructureFromPeople(peopleData: Array<{
  division?: string;
  department?: string;
}>): OrgStructureItem[] {
  const divisions = new Set<string>();
  const departments = new Map<string, string>(); // department -> division

  // Extract unique divisions and departments
  peopleData.forEach(person => {
    if (person.division) {
      divisions.add(person.division);
    }
    if (person.department) {
      departments.set(person.department, person.division || '');
    }
  });

  const result: OrgStructureItem[] = [];
  
  // Add divisions
  divisions.forEach(division => {
    result.push({
      id: `division_${normalizeText(division)}`,
      name: division,
      type: 'division'
    });
  });

  // Add departments
  departments.forEach((division, department) => {
    const parentId = division ? `division_${normalizeText(division)}` : undefined;
    result.push({
      id: `department_${normalizeText(department)}`,
      name: department,
      type: 'department',
      parent: parentId
    });
  });

  return result;
}
