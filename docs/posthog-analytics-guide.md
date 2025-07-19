# 📊 PostHog Analytics Implementation Guide for Headshot App

## Overview

This guide shows you how to implement comprehensive analytics for your AI headshot app using PostHog to track user behavior, optimize conversions, and grow your business.

## Table of Contents

1. [PostHog Setup](#setup)
2. [Event Tracking Strategy](#events)
3. [Funnel Analysis](#funnels)
4. [User Segmentation](#segments)
5. [A/B Testing](#ab-testing)
6. [Revenue Analytics](#revenue)
7. [Real-World Examples](#examples)

---

## 1. PostHog Setup {#setup}

### Step 1: Install PostHog

```bash
npm install posthog-js posthog-node
```

### Step 2: Create PostHog Provider

```javascript
// lib/posthog-provider.tsx
'use client'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'

if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    capture_pageview: false, // We'll handle this manually
    capture_pageleave: true,
    session_recording: {
      maskAllInputs: true,
      maskInputOptions: {
        password: true,
        email: false,
        creditCard: true
      }
    }
  })
}

export function PHProvider({ children }: { children: React.ReactNode }) {
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}
```

### Step 3: Wrap Your App

```javascript
// app/layout.tsx
import { PHProvider } from "@/lib/posthog-provider";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <PHProvider>{children}</PHProvider>
      </body>
    </html>
  );
}
```

---

## 2. Event Tracking Strategy {#events}

### Core Business Events for Headshot App

#### User Lifecycle Events

```javascript
// lib/analytics.js
import { usePostHog } from "posthog-js/react";

export const trackUserEvents = {
  // User registration
  userSignedUp: (data) => {
    posthog.capture("user_signed_up", {
      source: data.source, // 'google', 'email', 'social'
      plan_interest: data.planInterest,
      user_id: data.userId,
      email_domain: data.email.split("@")[1],
    });
  },

  // User identification
  identifyUser: (userId, properties) => {
    posthog.identify(userId, {
      email: properties.email,
      name: properties.name,
      subscription_plan: properties.plan,
      total_studios: properties.studioCount,
      lifetime_value: properties.ltv,
    });
  },

  // User upgrade
  userUpgraded: (data) => {
    posthog.capture("user_upgraded", {
      from_plan: data.fromPlan,
      to_plan: data.toPlan,
      revenue: data.amount,
      upgrade_reason: data.reason,
    });
  },
};
```

#### Studio Creation Events

```javascript
export const trackStudioEvents = {
  // Studio creation started
  studioCreationStarted: (data) => {
    posthog.capture("studio_creation_started", {
      user_id: data.userId,
      plan_type: data.planType,
      context: data.context, // 'personal' or 'organization'
    });
  },

  // Step completion
  stepCompleted: (data) => {
    posthog.capture("studio_step_completed", {
      step_name: data.stepName, // 'plan_selection', 'image_upload', etc.
      step_number: data.stepNumber,
      time_spent: data.timeSpent,
      studio_id: data.studioId,
    });
  },

  // Studio created successfully
  studioCreated: (data) => {
    posthog.capture("studio_created", {
      studio_id: data.studioId,
      plan_type: data.planType,
      image_count: data.imageCount,
      style_pairs: data.stylePairs,
      total_prompts: data.totalPrompts,
      creation_time: data.creationTime,
    });
  },

  // Studio generation completed
  studioGenerated: (data) => {
    posthog.capture("studio_generated", {
      studio_id: data.studioId,
      generation_time: data.generationTime,
      success_rate: data.successRate,
      total_images: data.totalImages,
    });
  },
};
```

#### Payment Events

```javascript
export const trackPaymentEvents = {
  // Payment initiated
  paymentInitiated: (data) => {
    posthog.capture("payment_initiated", {
      plan_type: data.planType,
      amount: data.amount,
      currency: data.currency,
      payment_method: data.paymentMethod,
    });
  },

  // Payment completed
  paymentCompleted: (data) => {
    posthog.capture("payment_completed", {
      plan_type: data.planType,
      amount: data.amount,
      currency: data.currency,
      payment_method: data.paymentMethod,
      transaction_id: data.transactionId,
    });
  },

  // Payment failed
  paymentFailed: (data) => {
    posthog.capture("payment_failed", {
      plan_type: data.planType,
      amount: data.amount,
      error_code: data.errorCode,
      error_message: data.errorMessage,
    });
  },
};
```

---

## 3. Funnel Analysis {#funnels}

### Studio Creation Funnel

```javascript
// Track the complete user journey
const studioCreationFunnel = [
  "user_signed_up",
  "studio_creation_started",
  "plan_selected",
  "images_uploaded",
  "attributes_completed",
  "payment_initiated",
  "payment_completed",
  "studio_created",
  "studio_generated",
];

// Implementation in your components
export function useStudioFunnel() {
  const posthog = usePostHog();

  const trackFunnelStep = (step, data) => {
    posthog.capture(step, {
      ...data,
      funnel: "studio_creation",
      timestamp: Date.now(),
    });
  };

  return { trackFunnelStep };
}
```

### Usage in Components

```javascript
// In your studio creation page
import { useStudioFunnel } from "@/lib/analytics";

export default function StudioCreate() {
  const { trackFunnelStep } = useStudioFunnel();

  useEffect(() => {
    trackFunnelStep("studio_creation_started", {
      user_id: userId,
      plan_type: selectedPlan,
    });
  }, []);

  const handleStepComplete = (stepName) => {
    trackFunnelStep("studio_step_completed", {
      step_name: stepName,
      step_number: currentStep,
      time_spent: Date.now() - stepStartTime,
    });
  };
}
```

---

## 4. User Segmentation {#segments}

### Define User Segments

```javascript
// lib/user-segments.js
export const userSegments = {
  // By plan type
  freeUsers: { subscription_plan: "free" },
  paidUsers: { subscription_plan: ["starter", "professional", "studio"] },

  // By usage
  powerUsers: { total_studios: { $gt: 5 } },
  newUsers: { days_since_signup: { $lt: 7 } },

  // By behavior
  highEngagement: { sessions_last_week: { $gt: 3 } },
  atRisk: { days_since_last_login: { $gt: 14 } },
};

// Track segment-specific events
export const trackSegmentEvent = (eventName, properties, segment) => {
  posthog.capture(eventName, {
    ...properties,
    user_segment: segment,
  });
};
```

---

## 5. A/B Testing {#ab-testing}

### Feature Flag Implementation

```javascript
// lib/feature-flags.js
import { useFeatureFlagEnabled } from "posthog-js/react";

export function useStudioFeatures() {
  const newUIEnabled = useFeatureFlagEnabled("new-studio-ui");
  const enhancedPrompts = useFeatureFlagEnabled("enhanced-prompts");
  const fastGeneration = useFeatureFlagEnabled("fast-generation");

  return {
    newUIEnabled,
    enhancedPrompts,
    fastGeneration,
  };
}

// Usage in components
export default function StudioCreation() {
  const { newUIEnabled } = useStudioFeatures();
  const posthog = usePostHog();

  useEffect(() => {
    posthog.capture("feature_flag_evaluated", {
      flag: "new-studio-ui",
      variant: newUIEnabled ? "enabled" : "disabled",
    });
  }, [newUIEnabled]);

  return <div>{newUIEnabled ? <NewStudioUI /> : <OldStudioUI />}</div>;
}
```

### A/B Test Examples

```javascript
// Test different pricing displays
const pricingVariant = posthog.getFeatureFlag("pricing-display");

switch (pricingVariant) {
  case "monthly-focus":
    return <MonthlyPricingDisplay />;
  case "annual-focus":
    return <AnnualPricingDisplay />;
  default:
    return <DefaultPricingDisplay />;
}

// Track conversion by variant
posthog.capture("pricing_page_viewed", {
  variant: pricingVariant,
  user_segment: userSegment,
});
```

---

## 6. Revenue Analytics {#revenue}

### Revenue Tracking

```javascript
// lib/revenue-analytics.js
export const trackRevenue = {
  // Monthly Recurring Revenue
  trackMRR: (data) => {
    posthog.capture("mrr_event", {
      amount: data.amount,
      plan_type: data.planType,
      user_id: data.userId,
      billing_cycle: data.billingCycle,
    });
  },

  // Customer Lifetime Value
  trackLTV: (data) => {
    posthog.capture("ltv_updated", {
      user_id: data.userId,
      current_ltv: data.currentLTV,
      predicted_ltv: data.predictedLTV,
      months_active: data.monthsActive,
    });
  },

  // Churn tracking
  trackChurn: (data) => {
    posthog.capture("user_churned", {
      user_id: data.userId,
      plan_type: data.planType,
      churn_reason: data.reason,
      ltv_at_churn: data.ltvAtChurn,
      months_subscribed: data.monthsSubscribed,
    });
  },
};
```

---

## 7. Real-World Examples {#examples}

### Example 1: Studio Creation Form

```javascript
// app/dashboard/studio/create/page.jsx
import { usePostHog } from "posthog-js/react";

export default function StudioCreate() {
  const posthog = usePostHog();
  const [formStartTime] = useState(Date.now());

  // Track form start
  useEffect(() => {
    posthog.capture("studio_form_started", {
      user_id: userId,
      context: selectedContext?.type,
      plan_type: selectedPlan,
    });
  }, []);

  // Track step progression
  const handleNext = () => {
    posthog.capture("studio_step_completed", {
      step: currentStep,
      step_name: getCurrentStepName(),
      time_spent: Date.now() - stepStartTime,
      validation_errors: Object.keys(errors).length,
    });

    // Move to next step
    next();
  };

  // Track form submission
  const onSubmit = async (data) => {
    const submissionTime = Date.now() - formStartTime;

    posthog.capture("studio_form_submitted", {
      total_time: submissionTime,
      image_count: data.images?.length || 0,
      style_pairs: data.style_pairs?.length || 0,
      plan_type: data.plan,
    });

    try {
      // Submit form
      await submitStudio(data);

      posthog.capture("studio_created_successfully", {
        studio_id: studioId,
        creation_time: submissionTime,
      });
    } catch (error) {
      posthog.capture("studio_creation_failed", {
        error_message: error.message,
        error_code: error.code,
        form_data: sanitizeFormData(data),
      });
    }
  };
}
```

### Example 2: Payment Flow

```javascript
// components/PaymentFlow.jsx
export default function PaymentFlow({ plan }) {
  const posthog = usePostHog();

  const handlePaymentStart = () => {
    posthog.capture("payment_flow_started", {
      plan_type: plan.type,
      amount: plan.price,
      currency: "USD",
      payment_method: selectedPaymentMethod,
    });
  };

  const handlePaymentSuccess = (paymentResult) => {
    posthog.capture("payment_completed", {
      plan_type: plan.type,
      amount: plan.price,
      transaction_id: paymentResult.id,
      payment_method: paymentResult.payment_method,
    });

    // Update user properties
    posthog.setPersonProperties({
      subscription_plan: plan.type,
      last_payment_date: new Date().toISOString(),
      total_revenue: userTotalRevenue + plan.price,
    });
  };
}
```

### Example 3: User Onboarding

```javascript
// components/Onboarding.jsx
export default function Onboarding() {
  const posthog = usePostHog();

  const trackOnboardingStep = (step, data) => {
    posthog.capture("onboarding_step_completed", {
      step_name: step,
      step_number: data.stepNumber,
      time_spent: data.timeSpent,
      user_selections: data.selections,
    });
  };

  const completeOnboarding = () => {
    posthog.capture("onboarding_completed", {
      total_time: Date.now() - onboardingStartTime,
      steps_completed: completedSteps.length,
      user_preferences: userPreferences,
    });
  };
}
```

---

## PostHog Dashboard Setup

### Key Metrics to Track

1. **Conversion Funnel**: Signup → Studio Creation → Payment
2. **User Engagement**: DAU, WAU, MAU, Session Duration
3. **Revenue Metrics**: MRR, LTV, Churn Rate
4. **Product Usage**: Studios Created, Images Generated
5. **Performance**: Page Load Times, Error Rates

### Custom Dashboards

```javascript
// PostHog Insights to create:
const insights = [
  {
    name: "Studio Creation Funnel",
    type: "funnel",
    events: studioCreationFunnel,
  },
  {
    name: "Revenue by Plan Type",
    type: "trend",
    events: ["payment_completed"],
    breakdown: "plan_type",
  },
  {
    name: "User Retention",
    type: "retention",
    events: ["user_signed_up", "studio_created"],
  },
];
```

---

## Implementation Checklist

### Week 1: Basic Setup

- [ ] Install PostHog
- [ ] Set up PostHog provider
- [ ] Implement user identification
- [ ] Track basic page views

### Week 2: Core Events

- [ ] Track studio creation events
- [ ] Implement payment tracking
- [ ] Set up user lifecycle events
- [ ] Create custom properties

### Week 3: Advanced Features

- [ ] Set up feature flags
- [ ] Implement A/B tests
- [ ] Create user segments
- [ ] Set up session recordings

### Week 4: Analytics & Optimization

- [ ] Create custom dashboards
- [ ] Set up alerts
- [ ] Implement cohort analysis
- [ ] Start optimization based on data

---

## Real-World Benefits

After implementing this analytics setup, you'll be able to:

1. **Identify Drop-off Points**: See exactly where users abandon the studio creation process
2. **Optimize Pricing**: Test different pricing strategies and measure impact
3. **Improve User Experience**: Use session recordings to see user struggles
4. **Increase Revenue**: Track and optimize conversion rates
5. **Reduce Churn**: Identify at-risk users and take action
6. **Make Data-Driven Decisions**: Base product decisions on real user behavior

Remember: Start with the most critical events first, then gradually add more detailed tracking as you learn what matters most for your business!
