import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ChevronDown, Users, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MagicPathEmployee } from './types';

interface EmployeeMultiSelectDropdownProps {
  employees: MagicPathEmployee[];
  selectedEmployees: MagicPathEmployee[];
  onSelectionChange: (employees: MagicPathEmployee[]) => void;
}

const EmployeeMultiSelectDropdown: React.FC<EmployeeMultiSelectDropdownProps> = ({
  employees,
  selectedEmployees,
  onSelectionChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isEmployeeSelected = (employee: MagicPathEmployee) =>
    selectedEmployees.some(selected => selected.id === employee.id);

  const handleEmployeeToggle = (employee: MagicPathEmployee) => {
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
      const remainingSelected = selectedEmployees.filter(selected =>
        !filteredEmployees.some(filtered => filtered.id === selected.id)
      );
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

  const allFilteredSelected = filteredEmployees.length > 0 &&
    filteredEmployees.every(employee => isEmployeeSelected(employee));

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

  // Simulate loading when searching
  useEffect(() => {
    if (searchTerm) {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 300);
      return () => clearTimeout(timer);
    }
  }, [searchTerm]);

  const getDepartmentColor = (department: string) => {
    const colors = {
      'Engineering': 'bg-blue-100 text-blue-800',
      'Operations': 'bg-green-100 text-green-800',
      'Product': 'bg-purple-100 text-purple-800',
      'Support': 'bg-orange-100 text-orange-800',
      'Design': 'bg-pink-100 text-pink-800',
      'Analytics': 'bg-indigo-100 text-indigo-800'
    };
    return colors[department as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6 dropdown-container">
      {/* Selected Employees Display */}
      {selectedEmployees.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Selected Team Members</h3>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
              {selectedEmployees.length} selected
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {selectedEmployees.map(employee => (
              <motion.div
                key={employee.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-xs font-semibold text-primary">
                      {employee.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {employee.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {employee.role}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeEmployee(employee.id)}
                  className="p-1 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-full transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Dropdown Selector */}
      <div className="relative" ref={dropdownRef} style={{ position: 'relative', zIndex: 1 }}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full flex items-center justify-between px-4 py-4 bg-background border-2 border-dashed border-border rounded-xl text-left transition-all duration-200 hover:border-primary/50",
            isOpen ? "border-primary bg-primary/5" : "hover:bg-muted/30"
          )}
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-muted rounded-lg">
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {selectedEmployees.length === 0
                  ? "Select team members"
                  : `${selectedEmployees.length} member${selectedEmployees.length === 1 ? '' : 's'} selected`}
              </p>
              <p className="text-xs text-muted-foreground">
                Choose from {employees.length} available employees
              </p>
            </div>
          </div>
          <ChevronDown className={cn(
            "h-5 w-5 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180"
          )} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute z-[9999] w-full mt-2 bg-popover/95 backdrop-blur-sm border border-border rounded-xl shadow-2xl overflow-hidden"
              style={{ position: 'absolute', top: '100%', left: 0, right: 0 }}
            >
              {/* Search Header */}
              <div className="p-4 border-b border-border bg-muted/30">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search by name, role, or department..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  />
                  {isLoading && (
                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
                  )}
                </div>
              </div>

              {/* Select All Option */}
              {filteredEmployees.length > 0 && (
                <div className="p-3 border-b border-border bg-muted/20">
                  <button
                    onClick={handleSelectAll}
                    className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-accent rounded-lg transition-colors"
                  >
                    <div className={cn(
                      "w-5 h-5 border-2 border-border rounded flex items-center justify-center transition-colors",
                      allFilteredSelected ? "bg-primary border-primary" : "bg-background"
                    )}>
                      {allFilteredSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {allFilteredSelected ? 'Deselect all' : 'Select all'} ({filteredEmployees.length})
                    </span>
                  </button>
                </div>
              )}

              {/* Employee List */}
              <div className="max-h-80 overflow-y-auto">
                {isLoading ? (
                  <div className="p-8 text-center">
                    <Loader2 className="h-6 w-6 text-muted-foreground animate-spin mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Searching employees...</p>
                  </div>
                ) : filteredEmployees.length === 0 ? (
                  <div className="p-8 text-center">
                    <Users className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                    <h4 className="text-sm font-medium text-foreground mb-1">No employees found</h4>
                    <p className="text-xs text-muted-foreground">
                      {employees.length === 0
                        ? "No employees exist in the system"
                        : "Try adjusting your search terms"}
                    </p>
                  </div>
                ) : (
                  <div className="p-3 space-y-1">
                    {filteredEmployees.map(employee => (
                      <motion.button
                        key={employee.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={() => handleEmployeeToggle(employee)}
                        className="w-full flex items-center space-x-3 px-3 py-3 hover:bg-accent rounded-lg transition-colors group"
                      >
                        <div className={cn(
                          "w-5 h-5 border-2 border-border rounded flex items-center justify-center transition-colors",
                          isEmployeeSelected(employee)
                            ? "bg-primary border-primary"
                            : "bg-background group-hover:border-primary/50"
                        )}>
                          {isEmployeeSelected(employee) && (
                            <Check className="h-3 w-3 text-primary-foreground" />
                          )}
                        </div>
                        
                        <div className="w-10 h-10 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">
                            {employee.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        
                        <div className="flex-1 text-left">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-foreground">
                              {employee.name}
                            </p>
                            <span className={cn(
                              "text-xs px-2 py-1 rounded-full font-medium",
                              getDepartmentColor(employee.department)
                            )}>
                              {employee.department}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {employee.role}
                          </p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EmployeeMultiSelectDropdown;