"use client";

import { useEffect, useState } from 'react';

export type Variant = 'A' | 'B';

export function useExperiment(experimentName: string): Variant {
  const [variant, setVariant] = useState<Variant>('A');

  useEffect(() => {
    const storageKey = `trodec_exp_${experimentName}`;
    const savedVariant = localStorage.getItem(storageKey) as Variant;
    
    if (savedVariant && (savedVariant === 'A' || savedVariant === 'B')) {
      setVariant(savedVariant);
    } else {
      // Random assignment (50/50 split)
      const newVariant: Variant = Math.random() > 0.5 ? 'A' : 'B';
      localStorage.setItem(storageKey, newVariant);
      setVariant(newVariant);
      
      // Optionally track assignment in analytics
      // analytics.track('experiment_started', { experiment: experimentName, variant: newVariant });
    }
  }, [experimentName]);

  return variant;
}
