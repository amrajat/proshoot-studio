/**
 * Plan Selection Step Component
 * Allows users to choose their studio plan
 */

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Check,
  Star,
  Users,
  Camera,
  Zap,
  Crown,
  ChevronRight,
  Info,
  UserCheck,
} from "lucide-react";
import useStudioCreateStore from "@/stores/studioCreateStore";
import { hasSufficientCredits } from "@/services/creditService";
import config from "@/config";

const PlanSelectionStep = ({ credits, formData, errors, selectedContext }) => {
  const { updateFormField, nextStep, setErrors } = useStudioCreateStore();
  const [selectedPlan, setSelectedPlan] = useState(formData.plan || "");

  // Plan definitions from config
  const plans = useMemo(() => {
    const configPlans = config.PLANS;
    const contextType = selectedContext?.type || "personal";

    // Filter plans based on account context
    const filteredPlans = Object.entries(configPlans)
      .filter(([key, plan]) => {
        if (contextType === "personal") {
          return plan.accountContext === "personal";
        } else {
          return plan.accountContext === "team";
        }
      })
      .map(([key, plan]) => ({
        id: key,
        name: key.charAt(0).toUpperCase() + key.slice(1),
        creditType: key,
        creditsRequired: 1,
        price: `$${plan.planPrice}`,
        popular: plan.mostPopular || false,
        icon:
          key === "starter"
            ? Users
            : key === "professional"
            ? Camera
            : key === "studio"
            ? Crown
            : UserCheck,
        color:
          key === "starter"
            ? "border-blue-200 bg-blue-50"
            : key === "professional"
            ? "border-purple-200 bg-purple-50"
            : key === "studio"
            ? "border-green-200 bg-green-50"
            : "border-gray-200 bg-gray-50",
        features: plan.features || [
          `${plan.totalHeadshots} AI headshots`,
          `${plan.stylesLimit} style combinations`,
          "Professional quality",
          "Email delivery",
        ],
        description:
          key === "starter"
            ? "Perfect for personal use and social media"
            : key === "professional"
            ? "Ideal for business professionals and LinkedIn"
            : key === "studio"
            ? "Best for content creators and agencies"
            : "Professional headshot generation",
        variantID: plan.variantID,
        totalHeadshots: plan.totalHeadshots,
        stylesLimit: plan.stylesLimit,
      }));

    return filteredPlans;
  }, [selectedContext]);

  // Check credit availability for each plan
  const plansWithAvailability = useMemo(() => {
    const contextType = selectedContext?.type || "personal";

    return plans.map((plan) => ({
      ...plan,
      // For personal accounts, always allow selection regardless of credits
      // For organization accounts, check actual credit availability
      available:
        contextType === "personal"
          ? true
          : hasSufficientCredits(
              credits,
              plan.creditType,
              plan.creditsRequired
            ),
      userCredits: credits?.[plan.creditType] || 0,
      hasCredits: hasSufficientCredits(
        credits,
        plan.creditType,
        plan.creditsRequired
      ),
    }));
  }, [plans, credits, selectedContext]);

  const handlePlanSelect = (planId) => {
    const plan = plansWithAvailability.find((p) => p.id === planId);
    const contextType = selectedContext?.type || "personal";

    // For organization accounts, still check credit availability
    if (contextType !== "personal" && !plan?.available) {
      setErrors({ plan: `You don't have enough ${plan.creditType} credits` });
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
      setErrors({ plan: `You don't have enough ${plan.creditType} credits` });
      return;
    }

    nextStep();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">Choose Your Plan</h2>
        <p className="text-muted-foreground">
          Select the plan that best fits your needs. You can upgrade anytime.
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plansWithAvailability.map((plan) => {
          const isSelected = selectedPlan === plan.id;
          const Icon = plan.icon;

          return (
            <Card
              key={plan.id}
              className={`
                relative cursor-pointer transition-all duration-200 hover:shadow-lg
                ${
                  isSelected
                    ? "border-primary ring-2 ring-primary/20 shadow-lg"
                    : plan.available
                    ? "border-border hover:border-primary/50"
                    : "border-border opacity-60"
                }
                ${"plan.color"}
              `}
              onClick={() => handlePlanSelect(plan.id)}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 rounded-none shadow-none">
                  <Badge className="bg-primary text-primary-foreground">
                    <Star className="h-3 w-3 mr-1" />
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
                      <a href="/dashboard/billing">Buy Credits</a>
                    </Button>
                  </div>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-3">
                  <div className="p-3 rounded-full bg-background shadow-sm">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                </div>

                <CardTitle className="text-xl">{plan.name}</CardTitle>

                <div className="space-y-1">
                  <div className="text-3xl font-bold text-primary">
                    {plan.price}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Uses 1 {plan.creditType} credit
                  </p>
                </div>

                <p className="text-sm text-muted-foreground mt-2">
                  {plan.description}
                </p>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Features List */}
                {/* <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm">
                      <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul> */}

                {/* Credit Status */}
                {/* <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">
                      Your {plan.creditType} credits:
                    </span>
                    <span
                      className={`font-medium ${
                        plan.hasCredits ? "text-green-600" : "text-amber-600"
                      }`}
                    >
                      {plan.userCredits}
                    </span>
                    {selectedContext?.type === "personal" &&
                      !plan.hasCredits && (
                        <Badge variant="outline" className="text-xs">
                          Payment Required
                        </Badge>
                      )}
                  </div>
                </div> */}

                {/* Select Button */}
                <Button
                  className="w-full"
                  variant={isSelected ? "default" : "outline"}
                  disabled={!plan.available}
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlanSelect(plan.id);
                  }}
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
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex justify-end">
        <Button
          onClick={handleNext}
          disabled={!selectedPlan}
          className="min-w-[120px]"
        >
          Next Step
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default PlanSelectionStep;
