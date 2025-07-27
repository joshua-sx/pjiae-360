import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchInputProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export default function SearchInput({ searchTerm, onSearchChange }: SearchInputProps) {
  return (
    <div className="relative mb-4">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
      <Input
        placeholder="Search by name, email, or department..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10"
      />
    </div>
  );
}