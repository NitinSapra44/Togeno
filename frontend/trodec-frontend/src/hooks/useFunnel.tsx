"use client";

import { useEffect, useState } from 'react';
import { analytics } from '@/services/analytics.service';

export type FunnelStep = 'Landing' | 'Product' | 'Cart' | 'Checkout' | 'Success';

const FUNNEL_STEPS: FunnelStep[] = ['Landing', 'Product', 'Cart', 'Checkout', 'Success'];

export function useFunnel() {
  const [currentStep, setCurrentStep] = useState<FunnelStep>('Landing');

  useEffect(() => {
    // Load last known funnel step from local storage on mount
    const savedStep = localStorage.getItem('trodec_funnel_step') as FunnelStep;
    if (savedStep && FUNNEL_STEPS.includes(savedStep)) {
      setCurrentStep(savedStep);
    }
  }, []);

  const advanceTo = (step: FunnelStep) => {
    const currentIndex = FUNNEL_STEPS.indexOf(currentStep);
    const newIndex = FUNNEL_STEPS.indexOf(step);

    // Only allow advancing forward or resetting
    if (newIndex > currentIndex || step === 'Landing') {
      setCurrentStep(step);
      localStorage.setItem('trodec_funnel_step', step);
      
      // Track the funnel progression event
      analytics.track('page_view', {
        funnel_step: step,
        previous_step: currentStep,
      });

      // If user reaches Success, we clear the funnel state so they can start over
      if (step === 'Success') {
        localStorage.removeItem('trodec_funnel_step');
      }
    }
  };

  const checkDropOff = () => {
    // A utility that could be called on unmount or visibility change
    // to determine if the user dropped off before completing the funnel
    if (currentStep !== 'Success' && currentStep !== 'Landing') {
      analytics.track('page_view', {
        action: 'drop_off',
        last_step: currentStep
      });
    }
  };

  return {
    currentStep,
    advanceTo,
    checkDropOff
  };
}
