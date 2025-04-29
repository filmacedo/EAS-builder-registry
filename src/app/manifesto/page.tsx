import { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Builders Manifesto | Builder Registry",
  description: "Our vision and mission for the Builder Registry",
};

export default function ManifestoPage() {
  return (
    <>
      <div className="max-w-3xl mx-auto py-8">
        <div className="prose prose-lg dark:prose-invert">
          <h1 className="text-4xl font-bold mb-8">Builders Manifesto</h1>

          <div className="relative w-full aspect-video mb-12">
            <iframe
              className="absolute top-0 left-0 w-full h-full rounded-lg"
              src="https://www.youtube.com/embed/0cFFvqnlh0Q?si=hH9GyZi966_zzAvp"
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              aria-label="Builders Manifesto video"
              loading="lazy"
            />
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">About Builders Day</h2>
            <p className="text-lg mb-4">
              In 2024, we established May 1st as Builder's Day by launching the{" "}
              <Link
                href="https://mirror.xyz/talentprotocol.eth/2miuIeU0Uq_uHIj_NzH0gk1Cdcc-06s_zyqo6iwO768"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Manifesto for Onchain Builders
              </Link>
              .
            </p>
            <p className="text-lg mb-4">
              For Builder's Day 2025, we're going beyond words with action.
              We're putting builders on Times Square and creating the first
              Registry of Verified Onchain Builders—a decentralized directory
              powered by onchain attestations and built collectively by trusted
              organizations across the industry.
            </p>
            <p className="text-lg">
              But Builders Day is more than just a directory - it's a platform
              to recognize and empower those who are building a better tomorrow.
            </p>
          </div>

          <div className="space-y-8 bg-gradient-to-b from-background to-muted/20 p-8 rounded-lg border">
            <h2 className="text-3xl font-bold text-center mb-12">
              Born to Build: A Manifesto for Onchain Builders
            </h2>

            <div className="space-y-8 text-lg leading-relaxed">
              <p className="font-medium">Say gm to the onchain builders.</p>

              <p className="font-medium">
                The ones shipping a better tomorrow, not simply hoping for it.
              </p>

              <p className="font-medium">
                They build their own path, breaking free from the corporate
                mold. They question the norms, ignore conventions, and reimagine
                the future.
              </p>

              <p className="font-medium">
                Where others see obstacles, they see opportunity.
              </p>

              <p className="font-medium">
                They are driven by curiosity, not corner offices. They don't
                seek power, but to empower. They are born to build, not to be
                bossed around.
              </p>

              <p className="font-medium">
                They keep building, even if their work goes unnoticed. They keep
                showing up, even when the market is down. They keep trying, even
                when others quit.
              </p>

              <p className="font-medium">
                While others applaud the loudest voices, we celebrate the unsung
                heroes of the blockchain.
              </p>

              <p className="font-medium">
                The world might underestimate them. Mock their ideals and laugh
                at their dreams. But they keep building. Not for quick gains,
                but driven by a need for lasting change.
              </p>

              <p className="font-medium">
                This is a testament to their courage, resilience, and
                creativity. We stand beside them, following their vision,
                supporting their work. You can't quantify their impact in market
                cap alone, because their legacy is being written in immutable
                code.
              </p>

              <p className="font-medium">
                They are the onchain builders. The visionaries of a new era, the
                rebels shaping the new internet.
              </p>

              <p className="font-medium">
                And while some dismiss them as naive, we know they are the most
                undervalued talent today. They are born to build, and that's why
                they are changing the world.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
