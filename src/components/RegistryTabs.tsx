"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { BuildersTable } from "@/components/BuildersTable";
import { PartnersTable } from "@/components/PartnersTable";
import { ProcessedBuilder, ProcessedPartner } from "@/services/builders";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { truncateAddress } from "@/lib/utils";

interface RegistryTabsProps {
  builders: ProcessedBuilder[];
  partners: ProcessedPartner[];
  onBuilderSearch: (value: string) => void;
  onPartnerSearch: (value: string) => void;
  onPartnerFilter: (partnerId: string | null) => void;
  availablePartners: { id: string; name: string }[];
  isSearching?: boolean;
}

interface FilterPill {
  text: string;
  onClear: () => void;
}

export function RegistryTabs({
  builders,
  partners,
  onBuilderSearch,
  onPartnerSearch,
  onPartnerFilter,
  availablePartners,
  isSearching = false,
}: RegistryTabsProps) {
  const [activeTab, setActiveTab] = useState("builders");
  const [searchValue, setSearchValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [partnerSearchQuery, setPartnerSearchQuery] = useState("");
  const [selectedPartner, setSelectedPartner] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Handle search submission
  const handleSearch = () => {
    if (!searchValue.trim()) return;

    if (activeTab === "builders") {
      onBuilderSearch(searchValue);
      setSearchQuery(searchValue);
    } else {
      onPartnerSearch(searchValue);
      setPartnerSearchQuery(searchValue);
    }
  };

  // Handle Enter key press for search
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Clear search query and results
  const clearSearch = () => {
    setSearchValue("");
    if (activeTab === "builders") {
      setSearchQuery("");
      onBuilderSearch("");
    } else {
      setPartnerSearchQuery("");
      onPartnerSearch("");
    }
  };

  // Handle partner filter selection
  const handlePartnerFilter = (value: string | null) => {
    if (!value || value === "all") {
      setSelectedPartner(null);
      onPartnerFilter(null);
    } else {
      const partner = availablePartners.find((p) => p.id === value);
      if (partner) {
        setSelectedPartner(partner);
        onPartnerFilter(value);
      }
    }
  };

  // Clear partner filter
  const clearPartnerFilter = () => {
    setSelectedPartner(null);
    onPartnerFilter(null);
  };

  // Format search query for display in pill
  const formatSearchQuery = (query: string) => {
    // Check if the query is an Ethereum address
    if (/^0x[a-fA-F0-9]{40}$/.test(query)) {
      return truncateAddress(query);
    }
    return query.length > 20 ? `${query.slice(0, 20)}...` : query;
  };

  // Reset all filters when changing tabs
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchValue("");
    if (value === "builders") {
      setPartnerSearchQuery("");
      onPartnerSearch("");
    } else {
      setSearchQuery("");
      onBuilderSearch("");
    }
    clearPartnerFilter();
  };

  // Get current active search query based on tab
  const getActiveSearchQuery = () => {
    return activeTab === "builders" ? searchQuery : partnerSearchQuery;
  };

  // Render a filter pill
  const FilterPill = ({ text, onClear }: FilterPill) => (
    <Badge variant="secondary" className="flex items-center gap-2">
      {text}
      <button onClick={onClear} className="hover:text-destructive">
        <X className="h-3 w-3" />
      </button>
    </Badge>
  );

  return (
    <Tabs
      defaultValue="builders"
      className="w-full"
      onValueChange={handleTabChange}
    >
      <div className="flex flex-col space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="builders">Builders</TabsTrigger>
          <TabsTrigger value="partners">Partners</TabsTrigger>
        </TabsList>

        {/* Search and Filter Controls */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder={
                activeTab === "builders"
                  ? "Search wallet address..."
                  : "Search name or address..."
              }
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10 h-11 text-base"
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={handleSearch}
              disabled={isSearching}
            >
              {isSearching ? "Searching..." : "Search"}
            </Button>
          </div>

          {/* Partner Filter Dropdown */}
          {activeTab === "builders" && (
            <div className="hidden md:block">
              <Select
                onValueChange={handlePartnerFilter}
                value={selectedPartner?.id || "all"}
              >
                <SelectTrigger className="w-[200px] h-11 text-base">
                  <SelectValue placeholder="Verified By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Partners</SelectItem>
                  {availablePartners.map((partner) => (
                    <SelectItem key={partner.id} value={partner.id}>
                      {partner.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Active Filters Display */}
        {(getActiveSearchQuery() ||
          (activeTab === "builders" && selectedPartner)) && (
          <div className="flex items-center gap-2 flex-wrap">
            {getActiveSearchQuery() && (
              <FilterPill
                text={formatSearchQuery(getActiveSearchQuery())}
                onClear={clearSearch}
              />
            )}
            {activeTab === "builders" && selectedPartner && (
              <FilterPill
                text={selectedPartner.name}
                onClear={clearPartnerFilter}
              />
            )}
          </div>
        )}

        {/* Content Tabs */}
        <TabsContent value="builders">
          <BuildersTable builders={builders} isSearching={isSearching} />
        </TabsContent>
        <TabsContent value="partners">
          <PartnersTable partners={partners} />
        </TabsContent>
      </div>
    </Tabs>
  );
}
