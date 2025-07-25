import * as React from "react";
import { useListData } from "react-stately";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface MultiSelectItem {
  id: string;
  label: string;
  supportingText?: string;
  avatarUrl?: string;
  disabled?: boolean;
}

interface MultiSelectProps {
  items: MultiSelectItem[];
  selectedItems: any; // react-stately ListData
  label?: string;
  placeholder?: string;
  hint?: string;
  tooltip?: string;
  isRequired?: boolean;
  children: (item: MultiSelectItem) => React.ReactNode;
}

interface MultiSelectItemProps {
  id: string;
  supportingText?: string;
  isDisabled?: boolean;
  icon?: React.ReactNode;
  avatarUrl?: string;
  children: React.ReactNode;
}

function MultiSelectItem({ children }: MultiSelectItemProps): JSX.Element {
  return <>{children}</>;
}

function MultiSelectComponent({
  items,
  selectedItems,
  label,
  placeholder = "Select items...",
  hint,
  tooltip,
  isRequired,
  children
}: MultiSelectProps): JSX.Element {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState('');

  const selectedIds = selectedItems.items.map((item: any) => item.id);

  const filteredItems = items.filter(item =>
    item.label.toLowerCase().includes(searchValue.toLowerCase()) ||
    (item.supportingText && item.supportingText.toLowerCase().includes(searchValue.toLowerCase()))
  );

  const handleItemToggle = (item: MultiSelectItem) => {
    const isSelected = selectedIds.includes(item.id);
    
    if (isSelected) {
      selectedItems.remove(item.id);
    } else {
      selectedItems.append(item);
    }
  };

  const handleRemoveItem = (itemId: string) => {
    selectedItems.remove(itemId);
  };

  return (
    <div className="w-full space-y-2">
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
          {isRequired && <span className="text-destructive ml-1">*</span>}
        </label>
      )}

      {/* Selected items badges */}
      {selectedItems.items.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedItems.items.map((item: MultiSelectItem) => (
            <Badge key={item.id} variant="secondary" className="flex items-center gap-1 py-1">
              {item.avatarUrl && (
                <Avatar className="w-4 h-4">
                  <AvatarImage src={item.avatarUrl} alt={item.label} />
                  <AvatarFallback className="text-xs">
                    {item.label.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              )}
              <span className="text-xs">{item.label}</span>
              <X 
                className="w-3 h-3 cursor-pointer hover:text-destructive" 
                onClick={() => handleRemoveItem(item.id)}
              />
            </Badge>
          ))}
        </div>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            <span className="truncate">
              {selectedItems.items.length === 0 
                ? placeholder 
                : `${selectedItems.items.length} item${selectedItems.items.length === 1 ? '' : 's'} selected`
              }
            </span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <Command>
            {/* Search */}
            <div className="flex items-center border-b px-3 py-2">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <Input
                placeholder="Search..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>

            <CommandList>
              <ScrollArea className="h-60">
                <CommandGroup>
                  {filteredItems.length === 0 ? (
                    <CommandEmpty>No items found.</CommandEmpty>
                  ) : (
                    <>
                      {/* Select All button */}
                      <CommandItem
                        key="select-all"
                        className="text-xs text-muted-foreground border-b mb-1 pb-1"
                        onSelect={() => {
                          const allItems = filteredItems.filter(item => !item.disabled);
                          if (allItems.every(item => selectedIds.includes(item.id))) {
                            // If all are selected, deselect all
                            allItems.forEach(item => {
                              selectedItems.remove(item.id);
                            });
                          } else {
                            // Otherwise, select all
                            allItems.forEach(item => {
                              if (!selectedIds.includes(item.id)) {
                                selectedItems.append(item);
                              }
                            });
                          }
                        }}
                      >
                        {filteredItems.filter(item => !item.disabled).every(item => selectedIds.includes(item.id))
                          ? "Deselect all"
                          : "Select all"}
                      </CommandItem>
                      
                       {filteredItems.map((item) => {
                        const isSelected = selectedIds.includes(item.id);
                        return (
                          <CommandItem
                            key={item.id}
                            onSelect={() => handleItemToggle(item)}
                            className="flex items-center space-x-3 cursor-pointer"
                            disabled={item.disabled}
                          >
                            <div className={cn(
                              "flex h-4 w-4 items-center justify-center rounded border border-primary",
                              isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible"
                            )}>
                              <Check className="h-3 w-3" />
                            </div>
                            {item.avatarUrl && (
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={item.avatarUrl} alt={item.label} />
                                <AvatarFallback>
                                  {item.label.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{item.label}</p>
                              {item.supportingText && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {item.supportingText}
                                </p>
                              )}
                            </div>
                          </CommandItem>
                        );
                      })}
                     </>
                  )}
                </CommandGroup>
              </ScrollArea>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {hint && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

export const MultiSelect = Object.assign(MultiSelectComponent, {
  Item: MultiSelectItem
});