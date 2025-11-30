import React, { useMemo, useCallback, useState, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Badge } from "@/components/ui/badge";
import { Check, ShieldCheck } from "lucide-react";
import useStudioCreateStore from "@/stores/studioCreateStore";
import config from "@/config";

const planIcons = {
  starter: (
    <svg
      className="size-6 items-center text-primary"
      width={34}
      height={30}
      viewBox="0 0 34 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        y={5}
        width={20}
        height={20}
        rx={10}
        fill="currentColor"
        className="fill-primary"
      />
    </svg>
  ),
  professional: (
    <svg
      className="size-6 items-center text-primary"
      width={34}
      height={30}
      viewBox="0 0 34 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x={7}
        width={20}
        height={20}
        rx={10}
        fill="currentColor"
        className="fill-primary/20"
      />
      <rect
        y={10}
        width={20}
        height={20}
        rx={10}
        fill="currentColor"
        className="fill-primary/40"
      />
      <rect
        x={14}
        y={10}
        width={20}
        height={20}
        rx={10}
        fill="currentColor"
        className="fill-primary"
      />
    </svg>
  ),
  studio: (
    <svg
      className="size-6 items-center text-primary"
      width={34}
      height={30}
      viewBox="0 0 34 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        width={20}
        height={20}
        rx={10}
        fill="currentColor"
        className="fill-primary/20"
      />
      <rect
        y={10}
        width={20}
        height={20}
        rx={10}
        fill="currentColor"
        className="fill-primary/40"
      />
      <rect
        x={14}
        y={10}
        width={20}
        height={20}
        rx={10}
        fill="currentColor"
        className="fill-primary/60"
      />
      <rect
        x={14}
        width={20}
        height={20}
        rx={10}
        fill="currentColor"
        className="fill-primary"
      />
    </svg>
  ),
};

// Reusable Plan Card Component
const PlanCard = ({ plan, configPlan, isSelected, onSelect }) => {
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onSelect(plan.id);
      }
    },
    [onSelect, plan.id]
  );

  const handleClick = useCallback(() => {
    onSelect(plan.id);
  }, [onSelect, plan.id]);

  const handleButtonClick = useCallback(
    (e) => {
      e.stopPropagation();
      onSelect(plan.id);
    },
    [onSelect, plan.id]
  );

  return (
    <div
      className="flex flex-col rounded-xl sm:rounded-2xl relative z-1 h-full group max-w-lg"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label={`Select ${plan.name} plan`}
    >
      <div
        className={`min-h-full bg-white rounded-xl sm:rounded-2xl cursor-pointer flex flex-col group-focus:ring-2 group-focus:ring-primary/20 overflow-hidden border border-border/50`}
      >
        {/* Card Content */}
        <div className="p-5 sm:p-6 lg:p-7 flex flex-col flex-1">
          {/* Header - Plan name, badge, and icon */}
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <h3 className="font-semibold text-primary">{plan.name}</h3>
            <div className="flex items-center gap-2">
              {/* Most Popular Badge - inline with icon */}
              {plan.popular && (
                <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-[10px] sm:text-xs font-semibold px-2 py-1 rounded-full">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
                  </span>
                  67% pick this
                </span>
              )}
              <div className="flex-shrink-0">{planIcons[plan.id]}</div>
            </div>
          </div>

          {/* Price */}
          <div className="text-foreground mb-2">
            <h4 className="inline-flex text-4xl sm:text-5xl font-semibold">
              <div className="inline-flex flex-wrap items-center">
                <span className="text-xl sm:text-2xl self-start me-0.5">$</span>
                {configPlan?.displayPrice || 0}
              </div>
            </h4>
            <p className="text-xs sm:text-sm text-muted-foreground">one time cost</p>
          </div>

          {/* Description */}
          <div className="mb-4 sm:mb-5">
            <p className="min-h-[36px] sm:min-h-[40px] text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {configPlan?.description}
            </p>
          </div>

          {/* Select Button - Destructive for studio plan, Primary for popular */}
          <button
            className={`py-2.5 sm:py-3 px-4 w-full inline-flex justify-center items-center gap-x-1 text-sm font-semibold rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 ${
              isSelected
                ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90"
                : plan.id === "studio"
                  ? "bg-destructive text-destructive-foreground border-destructive hover:bg-destructive/90"
                  : plan.popular
                    ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90"
                    : "bg-secondary text-secondary-foreground border-transparent hover:bg-secondary/80"
            }`}
            onClick={handleButtonClick}
            aria-label={
              isSelected
                ? `${plan.name} plan selected`
                : `Choose ${configPlan?.stylesLimit} styles`
            }
          >
            {isSelected ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Selected
              </>
            ) : (
              `Choose ${configPlan?.stylesLimit} styles`
            )}
          </button>

          {/* Features List */}
          <ul className="mt-4 sm:mt-5 space-y-2.5 sm:space-y-3 flex-1">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex space-x-3">
                <Check className="flex-shrink-0 mt-0.5 h-4 w-4 text-success" />
                <span className="text-xs sm:text-sm text-foreground leading-relaxed">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Money Back Guarantee - Full width at bottom */}
        <div className="bg-success/10 px-4 py-2 mt-auto">
          <p className="flex items-center justify-center gap-1.5 text-[10px] sm:text-xs font-medium text-success">
            <ShieldCheck className="h-3 w-3 sm:h-3.5 sm:w-3.5" strokeWidth={2.5} />
            100% MONEY BACK GUARANTEE
          </p>
        </div>
      </div>
    </div>
  );
};

const PlanSelectionStep = ({ formData, selectedContext }) => {
  const { updateFormField, nextStep } = useStudioCreateStore();

  // Embla carousel for mobile - start at most popular plan (index 1)
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "center",
    containScroll: "trimSnaps",
    startIndex: 1, // Start at "Professional" (most popular)
  });

  // Track current slide for dots
  const [selectedIndex, setSelectedIndex] = useState(1);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on("select", onSelect);
    onSelect(); // Set initial state

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  // Plan definitions from config - filter by account context
  const plans = useMemo(() => {
    const configPlans = config.PLANS;
    const contextType = selectedContext?.type || "personal";

    return Object.entries(configPlans)
      .filter(([, plan]) => {
        return contextType === "personal"
          ? plan.accountContext === "personal"
          : plan.accountContext === "team";
      })
      .map(([key, plan]) => ({
        id: key,
        name: key.charAt(0).toUpperCase() + key.slice(1),
        popular: plan.mostPopular || false,
        features: plan.features,
      }));
  }, [selectedContext]);

  const handlePlanSelect = useCallback(
    (planId) => {
      updateFormField("plan", planId);
      // Immediately advance to next step
      nextStep();
    },
    [updateFormField, nextStep]
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="text-center space-y-1 sm:space-y-2">
        <h2 className="text-xl sm:text-2xl font-semibold">Select your plan</h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Select the plan that best fits your needs.
        </p>
      </div>

      {/* Mobile Carousel - visible only on small screens */}
      <div className="sm:hidden -mx-4">
        <div className="overflow-hidden px-4" ref={emblaRef}>
          <div className="flex">
            {plans.map((plan, index) => {
              const isSelected = formData.plan === plan.id;
              const configPlan = config.PLANS[plan.id];

              return (
                <div
                  key={plan.id}
                  className={`flex-[0_0_88%] min-w-0 ${index === 0 ? '' : 'pl-3'}`}
                >
                  <PlanCard
                    plan={plan}
                    configPlan={configPlan}
                    isSelected={isSelected}
                    onSelect={handlePlanSelect}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Carousel Dots */}
        <div className="flex justify-center gap-2.5 mt-4 px-4">
          {plans.map((plan, index) => (
            <button
              key={plan.id}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                index === selectedIndex
                  ? "bg-primary scale-110"
                  : "bg-muted-foreground/25 hover:bg-muted-foreground/40"
              }`}
              onClick={() => emblaApi?.scrollTo(index)}
              aria-label={`Go to ${plan.name} plan`}
            />
          ))}
        </div>

        {/* Swipe hint */}
        <p className="text-center text-xs text-muted-foreground mt-2 px-4">
          Swipe to see more plans
        </p>
      </div>

      {/* Desktop/Tablet Grid - hidden on small screens */}
      <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {plans.map((plan) => {
          const isSelected = formData.plan === plan.id;
          const configPlan = config.PLANS[plan.id];

          return (
            <PlanCard
              key={plan.id}
              plan={plan}
              configPlan={configPlan}
              isSelected={isSelected}
              onSelect={handlePlanSelect}
            />
          );
        })}
      </div>
    </div>
  );
};

export default PlanSelectionStep;
