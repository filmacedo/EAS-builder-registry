import type { Metrics } from "@/types";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";

interface MetricsProps {
  data: Metrics;
  isLoading?: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

function CountingNumber({ value }: { value: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      const duration = 1000; // 1 second animation
      const steps = 30; // Number of steps
      const stepValue = value / steps;
      const stepDuration = duration / steps;

      let current = 0;
      const timer = setInterval(() => {
        current += 1;
        setCount(Math.min(Math.round(stepValue * current), value));

        if (current >= steps) {
          clearInterval(timer);
        }
      }, stepDuration);

      return () => clearInterval(timer);
    }
  }, [value, isInView]);

  return <span ref={ref}>{count}</span>;
}

export function Metrics({ data, isLoading = false }: MetricsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3 py-8">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-lg border p-6 bg-background animate-pulse"
          >
            <div className="h-8 w-24 bg-muted rounded mb-2" />
            <div className="h-4 w-32 bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      className="grid gap-4 md:grid-cols-3 py-8"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <motion.div
        className="rounded-lg border p-6 bg-background"
        variants={cardVariants}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <p className="text-4xl font-bold mb-2">
          <CountingNumber value={data.totalAttestations} />
        </p>
        <h3 className="text-sm font-medium text-muted-foreground">
          Total Attestations
        </h3>
      </motion.div>
      <motion.div
        className="rounded-lg border p-6 bg-background"
        variants={cardVariants}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <p className="text-4xl font-bold mb-2">
          <CountingNumber value={data.totalBuilders} />
        </p>
        <h3 className="text-sm font-medium text-muted-foreground">
          Verified Builders
        </h3>
      </motion.div>
      <motion.div
        className="rounded-lg border p-6 bg-background"
        variants={cardVariants}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <p className="text-4xl font-bold mb-2">
          <CountingNumber value={data.totalPartners} />
        </p>
        <h3 className="text-sm font-medium text-muted-foreground">
          Verification Partners
        </h3>
      </motion.div>
    </motion.div>
  );
}
