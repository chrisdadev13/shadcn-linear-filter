import { useState } from "react";
import {
  QueryBuilder,
  type ActiveFilter,
  type FilterConfig,
} from "./components/query-builder";

export default function App() {
  const [filters, setFilters] = useState<ActiveFilter[]>([]);

  const filterConfigs: FilterConfig[] = [
    {
      field: "status",
      options: ["pending", "active", "inactive"],
      type: "select",
    },
    {
      field: "type",
      options: ["project", "task", "ticket"],
      type: "select",
    },
  ];

  const handleFiltersChange = (filters: ActiveFilter[]) => {
    console.log("Current Filters:", filters);
    setFilters(filters);
  };
  return (
    <div className="w-screen h-screen flex items-center justify-center flex-col">
      <div className="flex items-center justify-between px-32 w-[65%]">
        <QueryBuilder
          filterConfigs={filterConfigs}
          onFiltersChange={handleFiltersChange}
        />
        <div className="text-xs bg-gray-100 w-72 border border-gray-300 pl-10 ml-10">
          <pre>{JSON.stringify(filters, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}
