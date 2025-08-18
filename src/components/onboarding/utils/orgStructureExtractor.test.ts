import { describe, it, expect } from 'vitest';
import { extractOrgStructureFromPeople } from './orgStructureExtractor';

describe('orgStructureExtractor', () => {
  describe('extractOrgStructureFromPeople', () => {
    it('should extract unique divisions and departments', () => {
      const people = [
        { division: 'Engineering', department: 'Software Development' },
        { division: 'Engineering', department: 'QA' },
        { division: 'Sales', department: 'Enterprise' },
        { division: 'Sales', department: 'SMB' }
      ];

      const result = extractOrgStructureFromPeople(people);

      expect(result).toHaveLength(6); // 2 divisions + 4 departments
      expect(result.filter(item => item.type === 'division')).toHaveLength(2);
      expect(result.filter(item => item.type === 'department')).toHaveLength(4);
    });

    it('should clean organizational names', () => {
      const people = [
        { division: 'engineering dept', department: 'software development team' },
        { division: 'SALES DIVISION', department: 'enterprise sales group' }
      ];

      const result = extractOrgStructureFromPeople(people);
      
      const engineering = result.find(item => item.name === 'Engineering');
      const softwareDev = result.find(item => item.name === 'Software Development');
      const sales = result.find(item => item.name === 'Sales');
      const enterprise = result.find(item => item.name === 'Enterprise Sales');

      expect(engineering).toBeDefined();
      expect(softwareDev).toBeDefined();
      expect(sales).toBeDefined();
      expect(enterprise).toBeDefined();
    });

    it('should handle empty input', () => {
      const result = extractOrgStructureFromPeople([]);
      expect(result).toEqual([]);
    });

    it('should handle people without division/department', () => {
      const people = [
        { name: 'John Doe' },
        { division: 'Engineering' },
        { department: 'Software Development' }
      ];

      const result = extractOrgStructureFromPeople(people);
      
      expect(result).toHaveLength(2); // 1 division + 1 department
      expect(result.some(item => item.name === 'Engineering')).toBe(true);
      expect(result.some(item => item.name === 'Software Development')).toBe(true);
    });

    it('should order divisions before departments', () => {
      const people = [
        { division: 'Engineering', department: 'Software Development' },
        { division: 'Sales', department: 'Enterprise' }
      ];

      const result = extractOrgStructureFromPeople(people);
      
      // First two should be divisions
      expect(result[0].type).toBe('division');
      expect(result[1].type).toBe('division');
      
      // Last two should be departments
      expect(result[2].type).toBe('department');
      expect(result[3].type).toBe('department');
    });

    it('should assign correct rank values', () => {
      const people = [
        { division: 'Engineering', department: 'Software Development' },
        { division: 'Sales', department: 'Enterprise' }
      ];

      const result = extractOrgStructureFromPeople(people);
      
      // Check that ranks are assigned sequentially
      result.forEach((item, index) => {
        expect(item.rank).toBe(index + 1);
      });
    });
  });
});