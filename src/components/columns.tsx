import { ColumnDef } from "@tanstack/react-table";

import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";

import { labels, priorities, statuses } from "../data/data";
import { Task } from "../data/schema";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";

export const columns: ColumnDef<Task>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Task" />
    ),
    cell: ({ row }) => <div className="w-[80px]">{row.getValue("id")}</div>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => {
      const label = labels.find((label) => label.value === row.original.label);

      return (
        <div className="flex space-x-2">
          {label && <Badge variant="outline">{label.label}</Badge>}
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("title")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = statuses.find(
        (status) => status.value === row.getValue("status"),
      );

      if (!status) {
        return null;
      }

      return (
        <div className="flex w-[100px] items-center">
          {status.icon && (
            <status.icon className="mr-2 h-4 w-4 text-muted-foreground" />
          )}
          <span>{status.label}</span>
        </div>
      );
    },
    filterFn: (row, columnId, filterValue) => {
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
    },
  },
  {
    accessorKey: "priority",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Priority" />
    ),
    cell: ({ row }) => {
      const priority = priorities.find(
        (priority) => priority.value === row.getValue("priority"),
      );

      if (!priority) {
        return null;
      }

      return (
        <div className="flex items-center">
          {priority.icon && (
            <priority.icon className="mr-2 h-4 w-4 text-muted-foreground" />
          )}
          <span>{priority.label}</span>
        </div>
      );
    },
    filterFn: (row, columnId, filterValue) => {
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
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
