
import { useState } from "react";
import { cn } from "@/lib/utils";
import { User, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Employee } from '../types';

interface EmployeeMultiSelectProps {
  employees: Employee[];
  selected: string[];
  setSelected: (ids: string[]) => void;
}

export function EmployeeMultiSelect({
  employees,
  selected,
  setSelected
}: EmployeeMultiSelectProps) {
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState<string | null>(null);

  const filtered = employees.filter(e => 
    (!department || e.department === department) && 
    (e.name.toLowerCase().includes(search.toLowerCase()) || 
     e.role.toLowerCase().includes(search.toLowerCase()))
  );

  const allIds = filtered.map(e => e.id);

  const handleSelect = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(sid => sid !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  const handleClearAll = () => setSelected([]);
  const handleSelectAll = () => setSelected(allIds);

  const uniqueDepartments = Array.from(new Set(employees.map(e => e.department)));

  return (
    <div className="space-y-2">
      {/* Chips preview */}
      <div className="flex flex-wrap gap-2 items-center min-h-[2.5rem] bg-muted rounded-lg px-2 py-1">
        {selected.length === 0 && (
          <span className="text-muted-foreground text-sm">No employees selected</span>
        )}
        {selected.map(id => {
          const emp = employees.find(e => e.id === id);
          if (!emp) return null;
          return (
            <span key={id} className="flex items-center gap-1 bg-card border border-border rounded-full px-3 py-1 text-sm font-medium shadow-sm">
              <User className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
              {emp.name}
              <button
                type="button"
                aria-label={`Remove ${emp.name}`}
                className="ml-1 text-muted-foreground hover:text-destructive focus:outline-none"
                onClick={() => handleSelect(id)}
              >
                ×
              </button>
            </span>
          );
        })}
        {selected.length > 0 && (
          <button
            type="button"
            className="ml-2 text-xs underline text-muted-foreground hover:text-foreground"
            onClick={handleClearAll}
            tabIndex={0}
          >
            Clear all
          </button>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
        <div className="flex-1 flex gap-2">
          <Input
            placeholder="Search employees..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full"
            aria-label="Search employees"
          />
          <Select value={department ?? ""} onValueChange={v => setDepartment(v || null)}>
            <SelectTrigger className="min-w-[120px]">
              <SelectValue placeholder="Filter by department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Departments</SelectItem>
              {uniqueDepartments.map(dep => (
                <SelectItem key={dep} value={dep}>{dep}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleSelectAll}
            disabled={allIds.length === 0 || allIds.every(id => selected.includes(id))}
          >
            Select all
          </Button>
        </div>
      </div>

      {/* Dropdown list */}
      <div className="border border-border rounded-lg bg-card max-h-56 overflow-y-auto mt-1">
        {filtered.length === 0 ? (
          <div className="p-3 text-muted-foreground text-sm">No employees found</div>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map(emp => (
              <li key={emp.id}>
                <button
                  type="button"
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-muted/50 focus:bg-muted/70 focus:outline-none",
                    selected.includes(emp.id) && "bg-primary/10"
                  )}
                  onClick={() => handleSelect(emp.id)}
                  aria-pressed={selected.includes(emp.id)}
                  tabIndex={0}
                >
                  <User className="w-5 h-5 text-muted-foreground flex-shrink-0" aria-hidden="true" />
                  <span className="flex-1">
                    <span className="font-medium text-foreground">{emp.name}</span>
                    <span className="block text-xs text-muted-foreground">{emp.role} • {emp.department}</span>
                  </span>
                  {selected.includes(emp.id) && (
                    <Check className="w-4 h-4 text-primary" aria-hidden="true" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Count */}
      <div className="text-xs text-muted-foreground mt-1">
        {selected.length} employee{selected.length !== 1 ? "s" : ""} selected
      </div>
    </div>
  );
}
