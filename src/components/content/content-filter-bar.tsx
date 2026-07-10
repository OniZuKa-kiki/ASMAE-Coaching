"use client";

import { Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import {
  FilterSelect,
  type FilterSelectOption,
} from "@/components/ui/filter-select";
import { cn } from "@/lib/utils";

export type ContentFilterField = {
  id: string;
  label: string;
  value: string;
  options: FilterSelectOption[];
  onChange: (value: string) => void;
};

type ContentFilterBarProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  searchLabel?: string;
  filters: ContentFilterField[];
  resultsCount?: number;
  resultsLabel?: string;
};

export function ContentFilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  searchLabel = "بحث",
  filters,
  resultsCount,
  resultsLabel,
}: ContentFilterBarProps) {
  return (
    <Card className="mb-8">
      <div className="space-y-4">
        <div>
          <Label htmlFor="content-search">{searchLabel}</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text/50" />
            <Input
              id="content-search"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="pr-10"
            />
          </div>
        </div>

        {filters.length > 0 ? (
          <div
            className={cn(
              "grid gap-4 grid-cols-1",
              filters.length >= 2 && "sm:grid-cols-2",
              filters.length >= 3 && "lg:grid-cols-3",
              filters.length >= 4 && "xl:grid-cols-4"
            )}
          >
            {filters.map((filter) => (
              <div key={filter.id} className="min-w-0">
                <Label>{filter.label}</Label>
                <FilterSelect
                  name={filter.id}
                  value={filter.value}
                  options={filter.options}
                  onChange={filter.onChange}
                />
              </div>
            ))}
          </div>
        ) : null}

        {resultsCount !== undefined && resultsLabel ? (
          <p className="text-sm text-text/60">{resultsLabel}</p>
        ) : null}
      </div>
    </Card>
  );
}
