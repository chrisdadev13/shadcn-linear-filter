import { Table } from "@tanstack/react-table";
import {
  ChartBar,
  ChartNoAxesColumnIncreasing,
  CircleDashed,
  X,
} from "lucide-react";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { DataTableViewOptions } from "./data-table-view-options";

import { priorities, statuses } from "../data/data";
import { DataTableFilter } from "./data-table-filter";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filter tasks..."
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("title")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        <DataTableFilter
          filters={[
            {
              column: table.getColumn("priority"),
              columnLabel: "Priority",
              title: "Priority",
              icon: <ChartNoAxesColumnIncreasing />,
              options: priorities.map((p) => ({
                value: p.value,
                label: p.label,
              })),
            },
            {
              column: table.getColumn("status"),
              columnLabel: "Status",
              title: "Status",
              icon: <CircleDashed />,
              options: statuses.map((s) => ({
                value: s.value,
                label: s.label,
              })),
            },
          ]}
        />
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}
