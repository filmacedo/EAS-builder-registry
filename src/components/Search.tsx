"use client";

import { Input } from "@/components/ui/input";
import { debounce } from "@/lib/utils";
import { useCallback, useMemo } from "react";

interface SearchProps {
  placeholder?: string;
  onSearch: (value: string) => void;
}

export function Search({
  placeholder = "Search by address or ENS...",
  onSearch,
}: SearchProps) {
  // Memoize the debounced search function
  const debouncedSearch = useMemo(
    () => debounce((value: string) => onSearch(value), 300),
    [onSearch]
  );

  // Memoize the onChange handler
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      debouncedSearch(e.target.value);
    },
    [debouncedSearch]
  );

  return (
    <div className="w-full max-w-md">
      <Input
        type="search"
        placeholder={placeholder}
        onChange={handleChange}
        className="w-full"
      />
    </div>
  );
}
