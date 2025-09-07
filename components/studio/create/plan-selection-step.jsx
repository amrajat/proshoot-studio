import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, Info, TrendingUp } from "lucide-react";
import useStudioCreateStore from "@/stores/studioCreateStore";
import { hasSufficientCredits } from "@/services/creditService";
import StepNavigation from "@/components/studio/create/step-navigation";
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

const PlanSelectionStep = ({ credits, formData, errors, selectedContext }) => {
  const { updateFormField, nextStep, setErrors } = useStudioCreateStore();
  const [selectedPlan, setSelectedPlan] = useState(formData.plan || "");

  // Plan definitions from config
  const plansWithAvailability = useMemo(() => {
    const configPlans = config.PLANS;
    const contextType = selectedContext?.type || "personal";

    // Filter and map plans based on account context
    return Object.entries(configPlans)
      .filter(([, plan]) => {
        if (contextType === "personal") {
          return plan.accountContext === "personal";
        } else {
          return plan.accountContext === "team";
        }
      })
      .map(([key, plan]) => ({
        id: key,
        name: key.charAt(0).toUpperCase() + key.slice(1),
        popular: plan.mostPopular || false,
        features: plan.features,
        // For personal accounts, always allow selection regardless of credits
        // For organization accounts, check actual credit availability
        available:
          contextType === "personal"
            ? true
            : hasSufficientCredits(credits, key, 1),
        userCredits: credits?.[key] || 0,
      }));
  }, [selectedContext, credits]);

  const handlePlanSelect = (planId) => {
    const plan = plansWithAvailability.find((p) => p.id === planId);
    const contextType = selectedContext?.type || "personal";

    // For organization accounts, still check credit availability
    if (contextType !== "personal" && !plan?.available) {
      setErrors({ plan: `You don't have enough ${planId} credits` });
      return;
    }

    setSelectedPlan(planId);
    updateFormField("plan", planId);
    setErrors({});
  };

  const handleNext = () => {
    if (!selectedPlan) {
      setErrors({ plan: "Please select a plan to continue" });
      return;
    }

    const plan = plansWithAvailability.find((p) => p.id === selectedPlan);
    const contextType = selectedContext?.type || "personal";

    // For organization accounts, still check credit availability
    if (contextType !== "personal" && !plan?.available) {
      setErrors({ plan: `You don't have enough ${selectedPlan} credits` });
      return;
    }

    nextStep();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">Select your plan</h2>
        <p className="text-muted-foreground">
          Select the plan that best fits your needs.
        </p>
      </div>

      {/* Error Display */}
      {errors.plan && (
        <Alert variant="destructive">
          <Info className="h-4 w-4" />
          <AlertDescription>{errors.plan}</AlertDescription>
        </Alert>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-5">
        {plansWithAvailability.map((plan) => {
          const isSelected = selectedPlan === plan.id;
          const configPlan = config.PLANS[plan.id];

          return (
            <div
              key={plan.id}
              className="flex flex-col rounded-2xl relative z-1"
              onClick={() => handlePlanSelect(plan.id)}
            >
              <div className="min-h-full p-6 md:p-7 bg-white rounded-[14px] cursor-pointer">
                {/* Most Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-0 left-6 md:left-7 transform">
                    <Badge
                      variant="secondary"
                      className="bg-primary/10 text-primary text-xs font-semibold"
                    >
                      <TrendingUp className="mr-1 size-3" strokeWidth={2.5} />
                      Most Popular
                    </Badge>
                  </div>
                )}

                {/* Unavailable Overlay */}
                {!plan.available && (
                  <div className="absolute inset-0 bg-background/80 rounded-lg flex items-center justify-center z-10">
                    <div className="text-center space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        Insufficient Credits
                      </p>
                      <p className="text-xs text-muted-foreground">
                        You have {plan.userCredits} {plan.creditType} credits
                      </p>
                      <Button variant="outline" size="sm" asChild>
                        <a href="/billing">Buy Credits</a>
                      </Button>
                    </div>
                  </div>
                )}

                {/* Header */}
                <div className="flex justify-between items-center mb-3 sm:mb-5">
                  <h3 className={`font-semibold text-primary`}>{plan.name}</h3>
                  <div className="flex-shrink-0">{planIcons[plan.id]}</div>
                </div>

                {/* Price */}
                <div className="text-foreground mb-2">
                  <h4 className="inline-flex text-5xl font-semibold">
                    <div className="inline-flex flex-wrap items-center gap-3">
                      <div className="inline-flex flex-wrap items-center">
                        <span className="text-2xl self-start me-1">$</span>
                        {configPlan?.displayPrice || 0}
                      </div>
                    </div>
                  </h4>
                  <p className="text-sm text-muted-foreground">one time cost</p>
                </div>

                {/* Description */}
                <div className="mb-5">
                  <p className="sm:min-h-[40px] text-sm text-muted-foreground">
                    {configPlan?.description || plan.description}
                  </p>
                </div>

                {/* Select Button */}
                <button
                  className={`py-3 px-4 w-full inline-flex justify-center items-center gap-x-1 text-sm font-semibold rounded-lg border border-transparent ${
                    isSelected
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  } disabled:opacity-50 disabled:pointer-events-none focus:outline-none`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlanSelect(plan.id);
                  }}
                  disabled={!plan.available}
                >
                  {isSelected ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Selected
                    </>
                  ) : plan.available ? (
                    "Select Plan"
                  ) : (
                    "Insufficient Credits"
                  )}
                </button>

                {/* Features List */}
                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex space-x-4">
                      <Check className="flex-shrink-0 mt-0.5 h-4 w-4 text-success" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation */}
      <StepNavigation
        onNext={handleNext}
        nextDisabled={!selectedPlan}
        showPrevious={false}
        showReset={false}
      />
    </div>
  );
};

export default PlanSelectionStep;
