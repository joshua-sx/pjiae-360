import { useState, useEffect } from "react";

export interface SavedFilter {
  id: string;
  name: string;
  entity: "goals" | "appraisals" | "analytics";
  filters: Record<string, any>;
  createdAt: string;
}

export const useSavedFilters = (entity: SavedFilter["entity"]) => {
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);

  // Load saved filters from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`saved-filters-${entity}`);
      if (stored) {
        setSavedFilters(JSON.parse(stored));
      }
    } catch (error) {
      console.warn("Failed to load saved filters:", error);
    }
  }, [entity]);

  // Save filters to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(`saved-filters-${entity}`, JSON.stringify(savedFilters));
    } catch (error) {
      console.warn("Failed to save filters to localStorage:", error);
    }
  }, [savedFilters, entity]);

  const saveFilter = (name: string, filters: Record<string, any>) => {
    const newFilter: SavedFilter = {
      id: Date.now().toString(),
      name,
      entity,
      filters,
      createdAt: new Date().toISOString(),
    };
    setSavedFilters(prev => [...prev, newFilter]);
    return newFilter;
  };

  const updateFilter = (id: string, updates: Partial<SavedFilter>) => {
    setSavedFilters(prev => 
      prev.map(filter => 
        filter.id === id ? { ...filter, ...updates } : filter
      )
    );
  };

  const deleteFilter = (id: string) => {
    setSavedFilters(prev => prev.filter(filter => filter.id !== id));
  };

  const getFilter = (id: string) => {
    return savedFilters.find(filter => filter.id === id);
  };

  const listFilters = () => {
    return savedFilters.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  const applyFilter = (id: string) => {
    const filter = getFilter(id);
    return filter?.filters || {};
  };

  return {
    savedFilters: listFilters(),
    saveFilter,
    updateFilter,
    deleteFilter,
    getFilter,
    applyFilter,
  };
};