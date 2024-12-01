# ShadCN Filter - Linear Style

The important code is here: https://github.com/chrisdadev13/shadcn-linear-filter/blob/main/src/components/data-table-filter.tsx

And here: https://github.com/chrisdadev13/shadcn-linear-filter/blob/main/src/components/columns.tsx

https://github.com/user-attachments/assets/0a2059ba-1104-44e9-aebe-9d2cd1825f6f

This can be abstracted since is always going to be the same:

```typescript
const filterFn = (row, columnId, filterValue) => {
      if (!filterValue || filterValue.length === 0) return true;

      const rowValue = row.getValue(columnId)?.toString().toLowerCase() ?? "";

      const isFilters = filterValue.filter(
        (f: { condition: string; value: string }) => f.condition === "is",
      );
      const isNotFilters = filterValue.filter(
        (f: { condition: string; value: string }) => f.condition === "is not",
      );
      const containsFilters = filterValue.filter(
        (f: { condition: string; value: string }) => f.condition === "contains",
      );
      const doesNotContainFilters = filterValue.filter(
        (f: { condition: string; value: string }) =>
          f.condition === "does not contain",
      );

      const passesIsCondition =
        isFilters.length === 0 ||
        isFilters.some(
          (filter: { condition: string; value: string }) =>
            rowValue === filter.value.toLowerCase(),
        );

      const passesIsNotCondition =
        isNotFilters.length === 0 ||
        !isNotFilters.some(
          (filter: { condition: string; value: string }) =>
            rowValue === filter.value.toLowerCase(),
        );

      const passesContainsCondition =
        containsFilters.length === 0 ||
        containsFilters.some((filter: { condition: string; value: string }) =>
          rowValue.includes(filter.value.toLowerCase()),
        );

      const passesDoesNotContainCondition =
        doesNotContainFilters.length === 0 ||
        !doesNotContainFilters.some(
          (filter: { condition: string; value: string }) =>
            rowValue.includes(filter.value.toLowerCase()),
        );

      return (
        passesIsCondition &&
        passesIsNotCondition &&
        passesContainsCondition &&
        passesDoesNotContainCondition
      );
    }
  }
```
