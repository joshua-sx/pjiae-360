import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface YearFilterProps {
  value: string;
  onValueChange: (value: string) => void;
  years?: string[];
  placeholder?: string;
  className?: string;
}

export function YearFilter({ 
  value, 
  onValueChange, 
  years = ['All', '2024', '2023', '2022', '2021'], 
  placeholder = "Select year",
  className 
}: YearFilterProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {years.map((year) => (
          <SelectItem key={year} value={year}>
            {year === 'All' ? 'All Years' : year}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}