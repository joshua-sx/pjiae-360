import { v4 as uuidv4 } from 'uuid';
import { extractOrgStructureFromPeople } from './orgStructureExtractor';

export interface CsvPerson {
  firstName: string;
  lastName: string;
  email: string;
  jobTitle?: string;
  department?: string;
  division?: string;
  employeeNumber?: string;
  phoneNumber?: string;
  section?: string;
  rankLevel?: string;
}

export interface MappedPerson {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  department: string;
  division: string;
  employeeNumber?: string;
  phoneNumber?: string;
  section?: string;
  rankLevel?: string;
  employmentType?: 'full_time' | 'part_time' | 'contract' | 'intern';
  location?: string;
  costCenter?: string;
  startDate?: string;
  hireDate?: string;
  managerEmail?: string;
  status?: 'active' | 'pending' | 'inactive';
  employeeId?: number;
  employeeInfoId?: string;
  role?: string;
  errors?: string[];
}

export interface OrgStructureItem {
  id: string;
  name: string;
  type: 'division' | 'department' | 'custom';
  parent?: string;
  children?: string[];
  rank?: number;
  description?: string;
}

export const mapCsvToPeople = (
  csvRows: string[][],
  columnMapping: Record<string, string>,
  headers: string[]
): { people: MappedPerson[]; orgStructure: OrgStructureItem[] } => {
  const people: MappedPerson[] = [];
  
  csvRows.forEach((row, index) => {
    const person: Partial<CsvPerson> = {};
    
    // Map CSV row data using column mapping
    headers.forEach((header, headerIndex) => {
      const fieldKey = columnMapping[header];
      if (fieldKey && fieldKey !== 'skip' && row[headerIndex]) {
        (person as any)[fieldKey] = row[headerIndex].trim();
      }
    });
    
    // Validate required fields
    if (!person.firstName || !person.lastName || !person.email) {
      console.warn(`Skipping row ${index + 1}: Missing required fields`, person);
      return;
    }
    
    // Create mapped person with defaults
    const mappedPerson: MappedPerson = {
      id: uuidv4(),
      firstName: person.firstName,
      lastName: person.lastName,
      email: person.email,
      jobTitle: person.jobTitle || 'Employee',
      department: person.department || 'General',
      division: person.division || 'Main',
      employeeNumber: person.employeeNumber,
      phoneNumber: person.phoneNumber,
      section: person.section,
      rankLevel: person.rankLevel,
      status: 'pending',
      role: 'Employee'
    };
    
    people.push(mappedPerson);
  });
  
  // Extract organizational structure
  const orgStructure = extractOrgStructureFromPeople(people);
  
  return { people, orgStructure };
};