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

interface RegistryTabsProps {
  builders: ProcessedBuilder[];
  partners: ProcessedPartner[];
  onBuilderSearch: (value: string) => void;
  onPartnerSearch: (value: string) => void;
  onPartnerFilter: (partnerId: string | null) => void;
  availablePartners: { id: string; name: string }[];
}

export function RegistryTabs({
  builders,
  partners,
  onBuilderSearch,
  onPartnerSearch,
  onPartnerFilter,
  availablePartners,
}: RegistryTabsProps) {
  const [activeTab, setActiveTab] = useState("builders");

  return (
    <Tabs
      defaultValue="builders"
      className="w-full"
      onValueChange={setActiveTab}
    >
      <div className="flex flex-col space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="builders">Builders</TabsTrigger>
          <TabsTrigger value="partners">Partners</TabsTrigger>
        </TabsList>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder={
                activeTab === "builders"
                  ? "Search builders by address or ENS..."
                  : "Search partners by name, address or ENS..."
              }
              onChange={(e) =>
                activeTab === "builders"
                  ? onBuilderSearch(e.target.value)
                  : onPartnerSearch(e.target.value)
              }
              className="pl-10 h-11 text-base"
            />
          </div>
          {activeTab === "builders" && (
            <div className="hidden md:block">
              <Select onValueChange={(value) => onPartnerFilter(value || null)}>
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

        <TabsContent value="builders">
          <BuildersTable builders={builders} />
        </TabsContent>
        <TabsContent value="partners">
          <PartnersTable partners={partners} />
        </TabsContent>
      </div>
    </Tabs>
  );
}
