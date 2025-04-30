"use client";

import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import {
  containerVariants,
  textVariants,
  staggerChildren,
} from "@/lib/animations";

// Terminal window component to reduce duplication
function TerminalWindow({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      className="relative font-mono bg-card border border-border rounded-lg overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted border-b border-border">
        <span className="text-sm text-muted-foreground">{title}</span>
        <motion.div className="flex gap-2" whileHover={{ scale: 1.05 }}>
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 rounded-full bg-border"
              whileHover={{ backgroundColor: "var(--accent)" }}
              transition={{ duration: 0.2 }}
            />
          ))}
        </motion.div>
      </div>

      {/* Terminal Content */}
      <motion.div className="p-8" variants={staggerChildren}>
        {children}
      </motion.div>
    </motion.div>
  );
}

export default function ManifestoPage() {
  return (
    <>
      <div className="max-w-3xl mx-auto py-8">
        <div className="prose prose-lg dark:prose-invert">
          <TerminalWindow title="about.txt - READING">
            <motion.h1
              className="text-4xl font-bold mb-8 text-accent"
              variants={textVariants}
            >
              # Builders Day
            </motion.h1>

            <motion.div className="space-y-4" variants={staggerChildren}>
              <motion.p className="text-lg" variants={textVariants}>
                In 2024, we coined May 1st as Builders Day by launching the{" "}
                <Link
                  href="https://mirror.xyz/talentprotocol.eth/2miuIeU0Uq_uHIj_NzH0gk1Cdcc-06s_zyqo6iwO768"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:text-accent-light"
                >
                  Manifesto for Onchain Builders
                </Link>
                .
              </motion.p>
              <motion.p className="text-lg" variants={textVariants}>
                This year we put the names of 2,000+ onchain builders on Times
                Square and created the first Verified Registry of Onchain
                Builders.
              </motion.p>
              <motion.p className="text-lg" variants={textVariants}>
                Anyone can use this open primitive to find real builders across
                ecosystems. To be featured in the registry, builders need to be
                manually verified by trusted protocols, companies and
                communities.
              </motion.p>
              <motion.p className="text-lg" variants={textVariants}>
                But Builders Day is bigger than a billboard or a directory: it's
                a platform to recognize those building a better tomorrow.
              </motion.p>
            </motion.div>
          </TerminalWindow>

          {/* Video with same width as containers */}
          <motion.div
            className="relative w-full aspect-video mb-12"
            initial={{ scale: 0.98, opacity: 0 }}
            whileInView={{
              scale: 1,
              opacity: 1,
              transition: {
                duration: 0.5,
                ease: [0.25, 0.1, 0.25, 1],
              },
            }}
            viewport={{ once: true }}
          >
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
          </motion.div>

          <TerminalWindow title="manifesto.txt - READING">
            <motion.h2
              className="text-accent font-bold mb-12"
              variants={textVariants}
            >
              # Born to Build: A Manifesto for Onchain Builders
            </motion.h2>

            <motion.div className="space-y-6" variants={staggerChildren}>
              <motion.p variants={textVariants}>
                Say gm to the onchain builders.
              </motion.p>
              <motion.p variants={textVariants}>
                The ones shipping a better tomorrow, not simply hoping for it.
              </motion.p>
              <motion.p variants={textVariants}>
                They build their own path, breaking free from the corporate
                mold. They question the norms, ignore conventions, and reimagine
                the future.
              </motion.p>
              <motion.p variants={textVariants}>
                Where others see obstacles, they see opportunity.
              </motion.p>
              <motion.p variants={textVariants}>
                They are driven by curiosity, not corner offices. They don't
                seek power, but to empower. They are born to build, not to be
                bossed around.
              </motion.p>
              <motion.p variants={textVariants}>
                They keep building, even if their work goes unnoticed. They keep
                showing up, even when the market is down. They keep trying, even
                when others quit.
              </motion.p>
              <motion.p variants={textVariants}>
                While others applaud the loudest voices, we celebrate the unsung
                heroes of the blockchain.
              </motion.p>
              <motion.p variants={textVariants}>
                The world might underestimate them. Mock their ideals and laugh
                at their dreams. But they keep building. Not for quick gains,
                but driven by a need for lasting change.
              </motion.p>
              <motion.p variants={textVariants}>
                This is a testament to their courage, resilience, and
                creativity. We stand beside them, following their vision,
                supporting their work. You can't quantify their impact in market
                cap alone, because their legacy is being written in immutable
                code.
              </motion.p>
              <motion.p variants={textVariants}>
                They are the onchain builders. The visionaries of a new era, the
                rebels shaping the new internet.
              </motion.p>
              <motion.p variants={textVariants}>
                And while some dismiss them as naive, we know they are the most
                undervalued talent today. They are born to build, and that's why
                they are changing the world.
              </motion.p>
            </motion.div>
          </TerminalWindow>
        </div>
      </div>
      <Footer />
    </>
  );
}
