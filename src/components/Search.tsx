"use client";

import { Input } from "@/components/ui/input";

interface SearchProps {
  placeholder?: string;
  onSearch: (value: string) => void;
}

export function Search({
  placeholder = "Search by address or ENS...",
  onSearch,
}: SearchProps) {
  return (
    <div className="w-full max-w-md">
      <Input
        type="search"
        placeholder={placeholder}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onSearch(e.target.value)
        }
        className="w-full"
      />
    </div>
  );
}
