"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Copy, Check, ExternalLink } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { getVerificationPartners } from "@/services/eas";
import { VerificationPartnerAttestation } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import Image from "next/image";

const BUILDER_SCHEMA_UID =
  "0x597905068aedcde4321ceaf2c42e24d3bbe0af694159bececd686bf057ec7ea5";

interface Partner {
  id: string;
  address: string;
  name: string;
  ens?: string;
}

export default function VerificationGuidePage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [copying, setCopying] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const partnerAttestations = await getVerificationPartners();
        const processedPartners = partnerAttestations
          .filter(
            (
              p
            ): p is VerificationPartnerAttestation & {
              decodedData: NonNullable<
                VerificationPartnerAttestation["decodedData"]
              >;
            } => p.decodedData !== null
          )
          .map((p) => ({
            id: p.id,
            address: p.recipient,
            name: p.decodedData.name,
            ens: p.decodedData.ens,
          }))
          .sort((a, b) => a.name.localeCompare(b.name));
        setPartners(processedPartners);
      } catch (error) {
        console.error("Error fetching partners:", error);
      }
    };

    fetchPartners();
  }, []);

  const copyToClipboard = async (text: string) => {
    try {
      setCopying(true);
      await navigator.clipboard.writeText(text);
      toast({
        description: "Copied to clipboard",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        description: "Failed to copy to clipboard",
      });
    } finally {
      setCopying(false);
      // Reset copying state after animation
      setTimeout(() => setCopying(false), 1000);
    }
  };

  const truncateAddress = (address: string) => {
    return address.slice(0, 6) + "..." + address.slice(-4);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/partners">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Verification Guide</h1>
      </div>

      <div className="prose prose-slate max-w-none">
        <div className="rounded-lg border p-6 space-y-4">
          <h2 className="text-xl font-semibold m-0">Verification Partner</h2>
          <p className="text-muted-foreground">
            Select your organization to view a custom step-by-step guide.
          </p>
          <Select
            onValueChange={(value) => {
              const partner = partners.find((p) => p.id === value);
              setSelectedPartner(partner || null);
            }}
          >
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Choose organization" />
            </SelectTrigger>
            <SelectContent>
              {partners.map((partner) => (
                <SelectItem key={partner.id} value={partner.id}>
                  {partner.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedPartner ? (
          <div className="mt-8 space-y-6">
            <div className="rounded-lg border p-6 space-y-4">
              <h2 className="text-xl font-semibold">Video Tutorial</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative aspect-video rounded-lg overflow-hidden border bg-muted">
                  <div
                    style={{
                      position: "relative",
                      paddingBottom: "56.25%", // 16:9 aspect ratio
                      height: 0,
                    }}
                  >
                    <iframe
                      src="https://www.loom.com/embed/04ce3c6b217141be9db2e84ff8ad2619?sid=a14f7802-34e3-4932-ac58-507ca2ce1f1b"
                      frameBorder="0"
                      allowFullScreen
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <p>
                    Watch this quick tutorial to learn how to issue attestations
                    for your builders on EAS.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border p-6 space-y-4">
              <h2 className="text-xl font-semibold">Step 1: Access EAS</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative aspect-video rounded-lg overflow-hidden border bg-muted">
                  <Image
                    src="/images/guide/step-1.gif"
                    alt="Accessing EAS and connecting wallet"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <span className="font-medium">1.1</span>
                      <span>
                        Visit the EAS attestation page on Base network
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-medium">1.2</span>
                      <span>
                        Connect your wallet using the following approved
                        address:
                      </span>
                    </div>
                    <div className="bg-muted rounded-lg p-4 space-y-2 ml-6">
                      <p className="text-sm font-medium">
                        Approved Wallet Address
                      </p>
                      <div className="space-y-1 font-mono">
                        {selectedPartner.ens && (
                          <div className="text-sm">{selectedPartner.ens}</div>
                        )}
                        <div className="text-sm text-muted-foreground">
                          {truncateAddress(selectedPartner.address)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="font-medium">1.3</span>
                    <Button asChild>
                      <a
                        href={`https://base.easscan.org/attestation/attestWithSchema/${BUILDER_SCHEMA_UID}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2"
                      >
                        Open EAS <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border p-6 space-y-4">
              <h2 className="text-xl font-semibold">
                Step 2: Configure Toggles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative aspect-video rounded-lg overflow-hidden border bg-muted">
                  <Image
                    src="/images/guide/step-2.gif"
                    alt="Configuring isBuilder and Onchain toggles"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p>Set the following toggles:</p>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <span className="font-medium">2.1</span>
                        <span>Set the "isBuilder" toggle to True</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="font-medium">2.2</span>
                        <span>
                          Set the final toggle to "Onchain" (not "Offchain")
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border p-6 space-y-4">
              <h2 className="text-xl font-semibold">
                Step 3: Add Partner Reference
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative aspect-video rounded-lg overflow-hidden border bg-muted">
                  <Image
                    src="/images/guide/step-3.gif"
                    alt="Adding partner reference UID"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <span className="font-medium">3.1</span>
                      <span>
                        Click on "Advanced Options" to expand additional
                        settings
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <span className="font-medium">3.2</span>
                        <span>
                          Copy and paste the following UID in the "Referenced
                          Attestation UID" field:
                        </span>
                      </div>
                      <div className="bg-muted rounded-lg p-4 space-y-2 ml-6">
                        <p className="text-sm font-medium">
                          Partner Attestation UID
                        </p>
                        <div className="flex items-center justify-between gap-2 font-mono">
                          <span className="break-all">
                            {selectedPartner.id}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyToClipboard(selectedPartner.id)}
                            className="transition-all duration-200 shrink-0"
                          >
                            {copying ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border p-6 space-y-4">
              <h2 className="text-xl font-semibold">
                Step 4: Add Builder Addresses
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative aspect-video rounded-lg overflow-hidden border bg-muted">
                  <Image
                    src="/images/guide/step-4.gif"
                    alt="Adding multiple builder addresses"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <span className="font-medium">4.1</span>
                      <span>Click on "Import Addresses" to open the modal</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-medium">4.2</span>
                      <span>Select "Add Multiple Recipients"</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-medium">4.3</span>
                      <span>
                        Paste the list of addresses in the text input area (one
                        address per line)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border p-6 space-y-4">
              <h2 className="text-xl font-semibold">Step 5: Add Context</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative aspect-video rounded-lg overflow-hidden border bg-muted">
                  <Image
                    src="/images/guide/step-5.gif"
                    alt="Adding context information"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <span className="font-medium">5.1</span>
                    <div className="space-y-2">
                      <span>
                        Add relevant information about the builders in the
                        Context field
                      </span>
                      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                        <p className="text-sm text-yellow-800">
                          Note: This context will apply to all addresses in this
                          batch. If you need to add different contexts for
                          different groups (e.g., hackathon participants vs
                          winners), create separate attestations by repeating
                          this process for each group.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border p-6 space-y-4">
              <h2 className="text-xl font-semibold">
                Step 6: Submit Attestation
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative aspect-video rounded-lg overflow-hidden border bg-muted">
                  <Image
                    src="/images/guide/step-6.gif"
                    alt="Submitting the attestation"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <span className="font-medium">6.1</span>
                      <span>Review all the information</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-medium">6.2</span>
                      <span>Click "Attest" to submit</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-medium">6.3</span>
                      <span>Pay the transaction fee (on Base network)</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-medium">6.4</span>
                      <span>Wait for the transaction to be confirmed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border p-6 space-y-4 bg-muted/50">
              <h2 className="text-xl font-semibold">Important Notes</h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>
                  Make sure you&apos;re connected to the Base network in your
                  wallet
                </li>
                <li>
                  Double-check all builder addresses before submitting the
                  attestation
                </li>
                <li>
                  The attestation cannot be modified after submission, only
                  revoked
                </li>
                <li>
                  The builders will appear in the registry once the transaction
                  is confirmed
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="mt-8 rounded-lg border p-6 bg-muted/50">
            <p className="text-center text-muted-foreground">
              Your verification instructions will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
