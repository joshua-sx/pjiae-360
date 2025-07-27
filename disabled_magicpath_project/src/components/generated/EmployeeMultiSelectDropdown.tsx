import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ChevronDown, Users, Check } from 'lucide-react';
import { cn } from '../../lib/utils';
interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
}
interface EmployeeMultiSelectDropdownProps {
  employees: Employee[];
  selectedEmployees: Employee[];
  onSelectionChange: (employees: Employee[]) => void;
}
const EmployeeMultiSelectDropdown: React.FC<EmployeeMultiSelectDropdownProps> = ({
  employees,
  selectedEmployees,
  onSelectionChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const filteredEmployees = employees.filter(employee => employee.name.toLowerCase().includes(searchTerm.toLowerCase()) || employee.role.toLowerCase().includes(searchTerm.toLowerCase()) || employee.department.toLowerCase().includes(searchTerm.toLowerCase()));
  const isEmployeeSelected = (employee: Employee) => selectedEmployees.some(selected => selected.id === employee.id);
  const handleEmployeeToggle = (employee: Employee) => {
    if (isEmployeeSelected(employee)) {
      onSelectionChange(selectedEmployees.filter(selected => selected.id !== employee.id));
    } else {
      onSelectionChange([...selectedEmployees, employee]);
    }
  };
  const handleSelectAll = () => {
    const allFilteredSelected = filteredEmployees.every(employee => isEmployeeSelected(employee));
    if (allFilteredSelected) {
      // Deselect all filtered employees
      const remainingSelected = selectedEmployees.filter(selected => !filteredEmployees.some(filtered => filtered.id === selected.id));
      onSelectionChange(remainingSelected);
    } else {
      // Select all filtered employees
      const newSelections = filteredEmployees.filter(employee => !isEmployeeSelected(employee));
      onSelectionChange([...selectedEmployees, ...newSelections]);
    }
  };
  const removeEmployee = (employeeId: string) => {
    onSelectionChange(selectedEmployees.filter(employee => employee.id !== employeeId));
  };
  const allFilteredSelected = filteredEmployees.length > 0 && filteredEmployees.every(employee => isEmployeeSelected(employee));
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);
  return <div className="space-y-4">
      {/* Selected Employees Tags */}
      {selectedEmployees.length > 0 && <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Team Members</label>
          <div className="flex flex-wrap gap-2">
            {selectedEmployees.map(employee => <motion.div key={employee.id} initial={{
          opacity: 0,
          scale: 0.8
        }} animate={{
          opacity: 1,
          scale: 1
        }} exit={{
          opacity: 0,
          scale: 0.8
        }} className="flex items-center space-x-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm">
                <span className="font-medium">{employee.name}</span>
                <button onClick={() => removeEmployee(employee.id)} className="hover:bg-primary/20 rounded-full p-0.5 transition-colors">
                  <X className="h-3 w-3" />
                </button>
              </motion.div>)}
          </div>
        </div>}

      {/* Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button onClick={() => setIsOpen(!isOpen)} className={cn("w-full flex items-center justify-between px-4 py-3 bg-background border border-border rounded-lg text-left transition-colors", isOpen ? "border-primary ring-1 ring-primary/20" : "hover:border-border/80")}>
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {selectedEmployees.length === 0 ? "Search and select employees..." : `${selectedEmployees.length} item${selectedEmployees.length === 1 ? '' : 's'} selected`}
            </span>
          </div>
          <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
        </button>

        <AnimatePresence>
          {isOpen && <motion.div initial={{
          opacity: 0,
          y: -10
        }} animate={{
          opacity: 1,
          y: 0
        }} exit={{
          opacity: 0,
          y: -10
        }} transition={{
          duration: 0.2
        }} className="absolute z-50 w-full mt-2 bg-popover border border-border rounded-lg shadow-lg">
              {/* Search Input */}
              <div className="p-3 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input ref={searchInputRef} type="text" placeholder="Search employees..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
                </div>
              </div>

              {/* Select All Option */}
              {filteredEmployees.length > 0 && <div className="p-2 border-b border-border">
                  <button onClick={handleSelectAll} className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-accent rounded-md transition-colors">
                    <div className={cn("w-4 h-4 border border-border rounded flex items-center justify-center", allFilteredSelected ? "bg-primary border-primary" : "bg-background")}>
                      {allFilteredSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                    </div>
                    <span className="text-sm font-medium text-foreground">Select all</span>
                  </button>
                </div>}

              {/* Employee List */}
              <div className="max-h-64 overflow-y-auto">
                {filteredEmployees.length === 0 ? <div className="p-4 text-center text-sm text-muted-foreground">
                    No employees found
                  </div> : <div className="p-2">
                    {filteredEmployees.map(employee => <button key={employee.id} onClick={() => handleEmployeeToggle(employee)} className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-accent rounded-md transition-colors">
                        <div className={cn("w-4 h-4 border border-border rounded flex items-center justify-center", isEmployeeSelected(employee) ? "bg-primary border-primary" : "bg-background")}>
                          {isEmployeeSelected(employee) && <Check className="h-3 w-3 text-primary-foreground" />}
                        </div>
                        <div className="flex-1 text-left">
                          <div className="text-sm font-medium text-foreground">{employee.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {employee.role} • {employee.department}
                          </div>
                        </div>
                      </button>)}
                  </div>}
              </div>
            </motion.div>}
        </AnimatePresence>
      </div>
    </div>;
};
export default EmployeeMultiSelectDropdown;