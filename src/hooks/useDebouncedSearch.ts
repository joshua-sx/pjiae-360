import { useState, useEffect } from 'react';
import { useDebounce } from './useDebounce';

export function useDebouncedSearch(initialValue = '', delay = 300) {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const debouncedSearchTerm = useDebounce(searchTerm, delay);
  
  return {
    searchTerm,
    debouncedSearchTerm,
    setSearchTerm,
    isSearching: searchTerm !== debouncedSearchTerm
  };
}