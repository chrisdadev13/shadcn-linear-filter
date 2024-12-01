import { Button } from "./ui/button";
import { Check, FilterIcon, X } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { useMemo, useState } from "react";
import type { Column } from "@tanstack/react-table";
import { cn } from "../lib/utils";

type FilterCondition = "is" | "is not" | "contains" | "does not contain";

interface FilterItem {
  value: string;
  condition: FilterCondition;
}

interface DataTableFilterProps<TData, TValue> {
  columnLabel?: string;
  column?: Column<TData, TValue>;
  icon?: React.ReactNode;
  title?: string;
  options: {
    label: string;
    value: string;
  }[];
}

interface DataTableFilterComponentProps<TData, TValue> {
  filters: DataTableFilterProps<TData, TValue>[];
}

export function DataTableFilter<TData, TValue>({
  filters,
}: DataTableFilterComponentProps<TData, TValue>) {
  const [open, setOpen] = useState(false);
  const [currentColumnLabel, setCurrentColumnLabel] = useState<string | null>(
    null,
  );
  const [currentColumn, setCurrentColumn] = useState<Column<
    TData,
    TValue
  > | null>(null);
  const [currentOptions, setCurrentOptions] = useState<
    DataTableFilterProps<TData, TValue>["options"] | null
  >(null);
  const [activeFilters, setActiveFilters] = useState<{
    [columnId: string]: FilterItem[];
  }>({});

  const [currentCondition, setCurrentCondition] =
    useState<FilterCondition>("is");

  const facets = currentColumn?.getFacetedUniqueValues();
  const currentFilterValue = currentColumn?.getFilterValue() as
    | FilterItem[]
    | undefined;

  const selectedValues = useMemo(
    () => new Set(currentFilterValue?.map((f) => f.value) || []),
    [currentFilterValue],
  );

  const FiltersCommand = useMemo(() => {
    return (
      <Command>
        <CommandInput placeholder="Search filter..." className="h-9" />
        <CommandList>
          <CommandEmpty>No filter found.</CommandEmpty>
          <CommandGroup>
            {filters.map((filter) => (
              <CommandItem
                key={filter.title}
                value={filter.title}
                onSelect={() => {
                  if (filter.column) {
                    setCurrentColumn(filter.column);
                    setCurrentOptions(filter.options);
                    setCurrentColumnLabel(filter.columnLabel ?? null);
                    setCurrentCondition("is");
                  }
                }}
              >
                {filter.icon}
                {filter.title}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    );
  }, [filters]);

  const FilterSelectionCommand = useMemo(() => {
    return (
      <Command shouldFilter={false}>
        <CommandInput
          placeholder={`Search ${currentColumnLabel}...`}
          className="h-9"
        />
        <CommandList>
          <CommandEmpty>No options found.</CommandEmpty>
          <CommandGroup>
            {currentOptions?.map((option) => {
              const isSelected = selectedValues.has(option.value);
              return (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => {
                    setCurrentColumn(null);
                    setCurrentOptions(null);
                    setOpen(false);
                    if (currentColumn) {
                      const columnId = currentColumn.id;

                      if (isSelected) {
                        setActiveFilters((prev) => {
                          const updated = { ...prev };
                          if (updated[columnId]) {
                            updated[columnId] = updated[columnId].filter(
                              (filter) =>
                                filter.value !== option.value ||
                                filter.condition !== currentCondition,
                            );

                            if (updated[columnId].length === 0) {
                              delete updated[columnId];
                            }
                          }
                          return updated;
                        });
                      } else {
                        setActiveFilters((prev) => ({
                          ...prev,
                          [columnId]: [
                            ...(prev[columnId] || []),
                            {
                              value: option.value,
                              condition: currentCondition,
                            },
                          ],
                        }));
                      }

                      const filterValues: FilterItem[] =
                        activeFilters[columnId] || [];
                      const newFilterItem = {
                        value: option.value,
                        condition: currentCondition,
                      };
                      const updatedFilterValues = isSelected
                        ? filterValues.filter(
                            (f) =>
                              f.value !== option.value ||
                              f.condition !== currentCondition,
                          )
                        : [...filterValues, newFilterItem];

                      currentColumn?.setFilterValue(
                        updatedFilterValues.length
                          ? updatedFilterValues
                          : undefined,
                      );
                    }
                  }}
                >
                  <div
                    className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "opacity-50 [&_svg]:invisible",
                    )}
                  >
                    <Check />
                  </div>
                  <span>{option.label}</span>
                  {facets?.get(option.value) && (
                    <span className="ml-auto flex h-4 w-4 items-center justify-center font-mono text-xs">
                      {facets.get(option.value)}
                    </span>
                  )}
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>
      </Command>
    );
  }, [
    currentColumn,
    currentOptions,
    selectedValues,
    facets,
    currentColumnLabel,
    currentCondition,
    activeFilters,
  ]);

  const handleClearFilter = (
    columnId: string,
    value?: string,
    condition?: FilterCondition,
  ) => {
    setActiveFilters((prev) => {
      const updated = { ...prev };
      if (updated[columnId]) {
        if (value && condition) {
          updated[columnId] = updated[columnId].filter(
            (f) => f.value !== value || f.condition !== condition,
          );
        } else {
          delete updated[columnId];
        }
      }
      return updated;
    });

    const column = filters.find((f) => f.column?.id === columnId)?.column;
    if (column) {
      const currentFilterValue = column.getFilterValue() as
        | FilterItem[]
        | undefined;

      let newFilterValues: FilterItem[] | undefined;
      if (value && condition) {
        newFilterValues = currentFilterValue?.filter(
          (f) => f.value !== value || f.condition !== condition,
        );
      }

      column.setFilterValue(
        newFilterValues?.length ? newFilterValues : undefined,
      );
    }
  };

  const handleUpdateFilterCondition = (
    columnId: string,
    value: string,
    oldCondition: FilterCondition,
    newCondition: FilterCondition,
  ) => {
    setActiveFilters((prev) => {
      const updated = { ...prev };
      if (updated[columnId]) {
        updated[columnId] = updated[columnId].map((f) =>
          f.value === value && f.condition === oldCondition
            ? { ...f, condition: newCondition }
            : f,
        );
      }
      return updated;
    });

    const column = filters.find((f) => f.column?.id === columnId)?.column;
    if (column) {
      const currentFilterValue = column.getFilterValue() as
        | FilterItem[]
        | undefined;
      if (currentFilterValue) {
        const updatedFilterValues = currentFilterValue.map((f) =>
          f.value === value && f.condition === oldCondition
            ? { ...f, condition: newCondition }
            : f,
        );
        column.setFilterValue(updatedFilterValues);
      }
    }
  };

  return (
    <div className="flex w-full ">
      <div className="flex flex-wrap items-center space-x-2">
        {Object.entries(activeFilters).map(([columnId, filterItems]) =>
          filterItems.map((filterItem) => {
            const filter = filters.find((f) => f.column?.id === columnId);
            const option = filter?.options.find(
              (opt) => opt.value === filterItem.value,
            );
            return option ? (
              <FilterIndicator
                key={`${columnId}-${filterItem.value}-${filterItem.condition}`}
                field={columnId}
                label={option.label}
                condition={filterItem.condition}
                onClear={() =>
                  handleClearFilter(
                    columnId,
                    filterItem.value,
                    filterItem.condition,
                  )
                }
                onConditionChange={(newCondition) =>
                  handleUpdateFilterCondition(
                    columnId,
                    filterItem.value,
                    filterItem.condition,
                    newCondition,
                  )
                }
              />
            ) : null;
          }),
        )}
      </div>
      <Popover
        open={open}
        onOpenChange={(isOpen) => {
          setCurrentOptions(null);
          setOpen(isOpen);
        }}
      >
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="mr-2 flex items-center gap-1 px-1.5 ml-2 h-[1.75rem]"
          >
            <FilterIcon className="h-4 w-4" />
            Add filter
          </Button>
        </PopoverTrigger>
        <PopoverContent className="ml-40 w-[250px] p-0">
          {currentOptions === null ? FiltersCommand : FilterSelectionCommand}
        </PopoverContent>
      </Popover>
    </div>
  );
}

const FilterIndicator = ({
  field,
  label,
  condition,
  onClear,
  onConditionChange,
}: {
  field: string;
  label: string;
  condition: FilterCondition;
  onClear: () => void;
  onConditionChange: (condition: FilterCondition) => void;
}) => {
  const CONDITIONS: FilterCondition[] = [
    "is",
    "is not",
    "contains",
    "does not contain",
  ];
  const [open, setOpen] = useState(false);

  return (
    <div className="inline-flex h-7 items-center rounded-md border border-gray-200 bg-background px-0.5 text-sm shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      <div className="flex items-center px-2 py-0.5">
        <span className="text-xs capitalize">{field}</span>
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 rounded-none border-border/40 border-x px-2 py-0 font-normal text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            {condition}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[140px] p-0">
          <Command>
            <CommandList>
              <CommandGroup>
                {CONDITIONS.map((cond) => (
                  <CommandItem
                    key={cond}
                    value={cond}
                    onSelect={() => {
                      onConditionChange(cond);
                      setOpen(false);
                    }}
                  >
                    {cond}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 rounded-none px-2 py-0 text-gray-600 text-xs capitalize hover:bg-muted"
        >
          {label}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 rounded-none border-border/40 border-l px-0.5 py-0 text-xs hover:bg-muted"
          onClick={onClear}
        >
          <X className="h-3 w-3 text-gray-600" />
          <span className="sr-only">Clear filter</span>
        </Button>
      </div>
    </div>
  );
};
