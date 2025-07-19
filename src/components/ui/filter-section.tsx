
import React from 'react';
import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';

interface FilterSectionProps {
  children?: React.ReactNode;
  showSearch?: boolean;
  showFilter?: boolean;
  onSearch?: (value: string) => void;
  onFilter?: () => void;
}

export function FilterSection({ children, showSearch = false, showFilter = false, onSearch, onFilter }: FilterSectionProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1">
        {children}
      </div>
      <div className="flex gap-2">
        {showSearch && (
          <Button variant="outline" onClick={() => onSearch?.('')}>
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
        )}
        {showFilter && (
          <Button variant="outline" onClick={onFilter}>
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        )}
      </div>
    </div>
  );
}
