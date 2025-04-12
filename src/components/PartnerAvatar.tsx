import { Building } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface PartnerAvatarProps {
  url?: string;
  name: string;
}

export function PartnerAvatar({ url, name }: PartnerAvatarProps) {
  const [error, setError] = useState(false);

  if (!url || error) {
    return (
      <div className="relative h-10 w-10 rounded-full border-2 border-background bg-muted flex items-center justify-center">
        <Building className="h-8 w-8 text-muted-foreground" />
      </div>
    );
  }

  try {
    const domain = new URL(url).hostname;
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

    return (
      <div className="relative h-10 w-10 rounded-full border-2 border-background bg-muted overflow-hidden">
        <Image
          src={faviconUrl}
          alt={`${name} favicon`}
          fill
          className="object-cover"
          onError={() => setError(true)}
        />
      </div>
    );
  } catch {
    return (
      <div className="relative h-10 w-10 rounded-full border-2 border-background bg-muted flex items-center justify-center">
        <Building className="h-8 w-8 text-muted-foreground" />
      </div>
    );
  }
}
