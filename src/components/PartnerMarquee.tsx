import { Marquee } from "@/components/ui/marquee";
import Image from "next/image";

interface PartnerLogo {
  src: string;
  alt: string;
}

const partnerLogos: PartnerLogo[] = [
  { src: "/logos/alchemy.svg", alt: "Alchemy" },
  { src: "/logos/base.svg", alt: "Base" },
  { src: "/logos/blockscout.svg", alt: "Blockscout" },
  { src: "/logos/celo.svg", alt: "Celo" },
  { src: "/logos/eigenlayer.svg", alt: "EigenLayer" },
  { src: "/logos/ens.svg", alt: "ENS" },
  { src: "/logos/etherscan.svg", alt: "Etherscan" },
  { src: "/logos/ethglobal.svg", alt: "ETHGlobal" },
  { src: "/logos/farcaster.svg", alt: "Farcaster" },
  { src: "/logos/filecoin.svg", alt: "Filecoin" },
  { src: "/logos/lens.svg", alt: "Lens Protocol" },
  { src: "/logos/talent.svg", alt: "Talent Protocol" },
  { src: "/logos/thegraph.svg", alt: "The Graph" },
  { src: "/logos/world.svg", alt: "World ID" },
];

export function PartnerMarquee() {
  return (
    <div className="w-full bg-background">
      <div className="relative">
        {/* Left gradient */}
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background via-background/50 to-transparent z-10" />

        <div className="marquee-container">
          <Marquee className="w-full" speed={40}>
            {partnerLogos.map((logo, index) => (
              <div
                key={index}
                className="flex items-center justify-center w-[160px] group"
              >
                <div className="relative w-[100px] h-[40px] transition-transform duration-300 ease-out group-hover:scale-110">
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    fill
                    className="object-contain filter grayscale hover:grayscale-0 transition-all duration-300 dark:invert dark:brightness-200"
                    priority={index < 4}
                  />
                </div>
              </div>
            ))}
          </Marquee>
        </div>

        {/* Right gradient */}
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background via-background/50 to-transparent z-10" />
      </div>
    </div>
  );
}
