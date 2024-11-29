import { FilterIcon, X } from "lucide-react";
import { useId, useState, useMemo, useCallback } from "react";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";

type FilterCondition = "is" | "is not";

const CONDITIONS: FilterCondition[] = ["is", "is not"];

export interface FilterConfig {
  field: string;
  options: string[];
  type?: "select" | "text";
}

export interface ActiveFilter {
  id: string;
  field: string;
  value: string;
  condition: FilterCondition;
}

interface QueryBuilderProps {
  filterConfigs: FilterConfig[];
  onFiltersChange?: (filters: ActiveFilter[]) => void;
}

interface FilterIndicatorProps {
  filter: ActiveFilter;
  onConditionChange: (newCondition: FilterCondition) => void;
  onRemove: () => void;
}

const ConditionSelector = ({
  currentCondition,
  onConditionSelect,
}: {
  currentCondition: FilterCondition;
  onConditionSelect: (condition: FilterCondition) => void;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 rounded-none border-border/40 border-x px-2 py-0 font-normal text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          {currentCondition}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandList>
            <CommandGroup>
              {CONDITIONS.map((condition) => (
                <CommandItem
                  key={condition}
                  value={condition}
                  onSelect={() => {
                    onConditionSelect(condition);
                    setOpen(false);
                  }}
                >
                  {condition}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

const FilterIndicator = ({
  filter,
  onConditionChange,
  onRemove,
}: FilterIndicatorProps) => {
  return (
    <div className="inline-flex h-7 items-center rounded-md border border-gray-200 bg-background px-0.5 text-sm shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      <div className="flex items-center px-2 py-0.5">
        <span className="text-xs capitalize">{filter.field}</span>
      </div>
      <ConditionSelector
        currentCondition={filter.condition}
        onConditionSelect={(newCondition) => onConditionChange(newCondition)}
      />
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 rounded-none px-2 py-0 text-gray-600 text-xs hover:bg-muted"
        >
          {filter.value}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 rounded-none border-border/40 border-l px-0.5 py-0 text-xs hover:bg-muted"
          onClick={onRemove}
        >
          <X className="h-3 w-3 text-gray-600" />
          <span className="sr-only">Clear filter</span>
        </Button>
      </div>
    </div>
  );
};

export function QueryBuilder({
  filterConfigs,
  onFiltersChange,
}: QueryBuilderProps) {
  const [open, setOpen] = useState(false);
  const [currentFilter, setCurrentFilter] = useState<string | null>(null);
  const [filters, setFilters] = useState<ActiveFilter[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const id = useId();

  const filteredOptions = useMemo(() => {
    if (!currentFilter) return [];

    const currentFilterConfig = filterConfigs.find(
      (fc) => fc.field === currentFilter,
    );
    if (!currentFilterConfig) return [];

    return currentFilterConfig.options.filter((option) =>
      option.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [currentFilter, filterConfigs, searchTerm]);

  const handleFilterSelect = useCallback(
    (option: string) => {
      const newFilter: ActiveFilter = {
        id: `${id}-${currentFilter}-${option}-${filters.length}`,
        field: currentFilter!,
        value: option,
        condition: "is",
      };

      const updatedFilters = [...filters, newFilter];
      setFilters(updatedFilters);
      onFiltersChange?.(updatedFilters);

      setOpen(false);
      setCurrentFilter(null);
      setSearchTerm("");
    },
    [currentFilter, filters, onFiltersChange, id],
  );

  const updateFilterCondition = useCallback(
    (filterId: string, newCondition: FilterCondition) => {
      const updatedFilters = filters.map((filter) =>
        filter.id === filterId
          ? { ...filter, condition: newCondition }
          : filter,
      );

      setFilters(updatedFilters);
      onFiltersChange?.(updatedFilters);
    },
    [filters, onFiltersChange],
  );

  const removeFilter = useCallback(
    (filterId: string) => {
      const updatedFilters = filters.filter((f) => f.id !== filterId);
      setFilters(updatedFilters);
      onFiltersChange?.(updatedFilters);
    },
    [filters, onFiltersChange],
  );

  const FiltersCommand = useMemo(() => {
    return (
      <Command>
        <CommandInput
          placeholder="Search filter..."
          className="h-9"
          value={searchTerm}
          onValueChange={setSearchTerm}
        />
        <CommandList>
          <CommandEmpty>No filter found.</CommandEmpty>
          <CommandGroup>
            {filterConfigs.map((config) => (
              <CommandItem
                key={config.field}
                value={config.field}
                onSelect={() => {
                  setCurrentFilter(config.field);
                  setSearchTerm("");
                }}
              >
                {config.field}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    );
  }, [filterConfigs, searchTerm]);

  const FilterSelectionCommand = useMemo(() => {
    return (
      <Command shouldFilter={false}>
        <CommandInput
          placeholder={`Search ${currentFilter}...`}
          value={searchTerm}
          onValueChange={setSearchTerm}
          className="h-9"
        />
        <CommandList>
          <CommandEmpty>No options found.</CommandEmpty>
          <CommandGroup>
            {filteredOptions.map((option) => (
              <CommandItem
                key={option}
                value={option}
                onSelect={() => handleFilterSelect(option)}
              >
                {option}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    );
  }, [currentFilter, filteredOptions, handleFilterSelect, searchTerm]);

  return (
    <div className="flex w-full items-center space-x-2">
      <Popover
        open={open}
        onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) {
            setCurrentFilter(null);
            setSearchTerm("");
          }
        }}
      >
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="flex h-[1.7rem] items-center gap-1 px-1.5"
          >
            <FilterIcon className="h-4 w-4" />
            Add filter
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[250px] p-0">
          {currentFilter === null ? FiltersCommand : FilterSelectionCommand}
        </PopoverContent>
      </Popover>

      <div className="flex items-center space-x-2">
        {filters.map((filter) => (
          <FilterIndicator
            key={filter.id}
            filter={filter}
            onConditionChange={(newCondition) =>
              updateFilterCondition(filter.id, newCondition)
            }
            onRemove={() => removeFilter(filter.id)}
          />
        ))}
      </div>
    </div>
  );
}
