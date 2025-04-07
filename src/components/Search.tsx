"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCallback, useEffect, useState } from "react";
import debounce from "lodash.debounce";

interface SearchProps {
  onSearch: (value: string) => void;
  onPartnerFilter: (partnerId: string | null) => void;
  partners: { id: string; name: string }[];
}

export function Search({ onSearch, onPartnerFilter, partners }: SearchProps) {
  const [value, setValue] = useState("");

  const debouncedSearch = useCallback(
    debounce((searchTerm: string) => {
      onSearch(searchTerm);
    }, 300),
    [onSearch]
  );

  useEffect(() => {
    debouncedSearch(value);
    return () => {
      debouncedSearch.cancel();
    };
  }, [value, debouncedSearch]);

  return (
    <div className="flex gap-4">
      <div className="flex-1">
        <Input
          type="search"
          placeholder="Search by address or ENS..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="max-w-xl"
        />
      </div>
      <Select onValueChange={(value) => onPartnerFilter(value || null)}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Verified By" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Partners</SelectItem>
          {partners.map((partner) => (
            <SelectItem key={partner.id} value={partner.id}>
              {partner.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
