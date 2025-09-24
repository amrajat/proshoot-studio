"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAccountContext } from "@/context/AccountContext";
import { createCheckoutUrl } from "@/lib/checkout";
import { validatePlanAction } from "@/lib/plan-validation";
import config from "@/config";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  CheckCircle2,
  Users,
  User,
  Minus,
  Plus,
  Check,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

// ===== TEAM PLAN VOLUME DISCOUNTS =====
const TEAM_VOLUME_DISCOUNTS = [
  { minQuantity: 2, discount: 0 },
  { minQuantity: 5, discount: 0.1 },
  { minQuantity: 25, discount: 0.2 },
  { minQuantity: 100, discount: 0.3 },
];

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
  team: (
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

export default function BuyCreditsPage() {
  // ===== HOOKS =====
  const { selectedContext } = useAccountContext();

  // ===== STATE MANAGEMENT =====
  const [isLoading, setIsLoading] = useState(false);
  const [quantities, setQuantities] = useState({});
  const [selectedPlan, setSelectedPlan] = useState("");
  const [activeTab, setActiveTab] = useState("personal");
  const [planPricing, setPlanPricing] = useState({});

  // ===== INITIALIZATION =====
  useEffect(() => {
    // Set default tab based on context
    if (selectedContext?.type === "organization") {
      setActiveTab("organization");
      setSelectedPlan("team"); // Default to team plan for organization
    } else {
      setActiveTab("personal");
      setSelectedPlan("professional"); // Default to professional plan for personal
    }

    // Initialize quantities for all plans
    const initialQuantities = {};
    Object.keys(config.PLANS).forEach((planKey) => {
      if (planKey !== "balance") {
        initialQuantities[planKey] = planKey === "team" ? 2 : 1;
      }
    });
    setQuantities(initialQuantities);
  }, [selectedContext]);

  // ===== HELPER FUNCTIONS =====
  const getAvailablePlans = (context) => {
    const plans = {};
    Object.entries(config.PLANS).forEach(([key, plan]) => {
      if (key === "balance") return;

      if (context === "personal" && plan.accountContext === "personal") {
        plans[key] = plan;
      } else if (context === "organization" && key === "team") {
        plans[key] = plan;
      }
    });
    return plans;
  };

  const calculatePlanTotal = useCallback(async (planKey, quantity) => {
    // Use server-side validation and pricing calculation
    try {
      const result = await validatePlanAction(planKey, quantity);
      if (result.success) {
        const { pricing } = result;
        return {
          baseTotal: pricing.baseTotal.toFixed(2),
          total: pricing.total.toFixed(2),
          discount: pricing.discount.toFixed(0),
          savings: pricing.savings.toFixed(2),
        };
      } else {
        // Fallback to display price for UI consistency
        const plan = config.PLANS[planKey];
        const fallbackTotal = (plan?.displayPrice || 0) * quantity;
        return {
          baseTotal: fallbackTotal.toFixed(2),
          total: fallbackTotal.toFixed(2),
          discount: "0",
          savings: "0.00",
        };
      }
    } catch (error) {
      // Fallback to display price for UI consistency
      const plan = config.PLANS[planKey];
      const fallbackTotal = (plan?.displayPrice || 0) * quantity;
      return {
        baseTotal: fallbackTotal.toFixed(2),
        total: fallbackTotal.toFixed(2),
        discount: "0",
        savings: "0.00",
      };
    }
  }, []);

  // Helper function to update plan pricing
  const updatePlanPricing = useCallback(
    async (planKey, quantity) => {
      try {
        const pricing = await calculatePlanTotal(planKey, quantity);
        setPlanPricing((prev) => ({
          ...prev,
          [`${planKey}-${quantity}`]: pricing,
        }));
      } catch (error) {
        }
    },
    [calculatePlanTotal]
  );

  // Separate effect for pricing initialization to avoid dependency issues
  useEffect(() => {
    // Initialize pricing for all plans
    Object.keys(config.PLANS).forEach((planKey) => {
      if (planKey !== "balance") {
        const qty = planKey === "team" ? 2 : 1;
        updatePlanPricing(planKey, qty);
      }
    });
  }, [updatePlanPricing]);

  const updateQuantity = (planKey, change) => {
    setQuantities((prev) => {
      const currentQty = prev[planKey] || 1;
      const newQty = Math.max(planKey === "team" ? 2 : 1, currentQty + change);
      return { ...prev, [planKey]: newQty };
    });
    // Update pricing when quantity changes
    updatePlanPricing(
      planKey,
      Math.max(planKey === "team" ? 2 : 1, (quantities[planKey] || 1) + change)
    );
  };

  const setDirectQuantity = (planKey, value) => {
    const numValue = parseInt(value) || 0;
    const minQty = planKey === "team" ? 2 : 1;
    const validQty = Math.max(minQty, numValue);
    setQuantities((prev) => ({ ...prev, [planKey]: validQty }));
    // Update pricing when quantity changes
    updatePlanPricing(planKey, validQty);
  };

  // Helper function to get pricing for a plan
  const getPlanPricing = (planKey, quantity) => {
    const key = `${planKey}-${quantity}`;
    return (
      planPricing[key] || {
        total: ((config.PLANS[planKey]?.displayPrice || 0) * quantity).toFixed(
          2
        ),
        discount: "0",
        savings: "0.00",
      }
    );
  };

  const handlePlanSelect = (planKey) => {
    setSelectedPlan(planKey);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Set default plan based on tab
    if (tab === "organization") {
      setSelectedPlan("team");
    } else {
      setSelectedPlan("professional");
    }
  };

  const handleCheckout = async (planKey) => {
    if (isLoading) return;

    setIsLoading(true);
    setSelectedPlan(planKey);

    try {
      const quantity = quantities[planKey] || 1;

      toast.loading("Validating plan...");

      // Validate plan server-side before checkout
      const validation = await validatePlanAction(planKey, quantity);
      if (!validation.success) {
        toast.dismiss();
        toast.error("Plan validation failed. Please try again.");
        setIsLoading(false);
        setSelectedPlan("");
        return;
      }

      toast.dismiss();
      toast.loading("Creating secure checkout...");

      // Create checkout URL with secure server-side validation
      const checkoutUrl = await createCheckoutUrl(
        planKey,
        quantity,
        {
          source: "buy_page",
        },
        `${window.location.origin}/studio/create?payment=success&plan=${planKey}&quantity=${quantity}`
      );

      toast.dismiss();

      if (checkoutUrl) {
        toast.success("Redirecting to secure checkout...");
        // Direct redirect to LemonSqueezy checkout for maximum conversion
        window.location.href = checkoutUrl;
      } else {
        toast.error("Unable to create checkout. Please try again.");
        setIsLoading(false);
        setSelectedPlan("");
      }
    } catch (error) {
      toast.dismiss();
      // Sanitized error message for security
      toast.error("Something went wrong. Please try again or contact support.");
      setIsLoading(false);
      setSelectedPlan("");
    }
  };

  // ===== RENDER PLAN CARD (NEW STYLED) =====
  const renderPlanCard = (planKey, plan) => {
    const quantity = quantities[planKey] || 1;
    const pricing = getPlanPricing(planKey, quantity);

    const getPlanButtonStyle = (key) => {
      if (key === "professional") {
        return "bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:bg-primary/90";
      }
      return "bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:bg-secondary/80";
    };

    return (
      <div
        key={planKey}
        className="flex flex-col rounded-2xl relative z-1"
        onClick={() => handlePlanSelect(planKey)}
      >
        <div className="min-h-full p-6 md:p-7 bg-white rounded-[14px]">
          {plan.mostPopular && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge
                variant="secondary"
                className="bg-primary/10 text-primary text-xs font-semibold"
              >
                <TrendingUp className="mr-1 size-3" strokeWidth={2.5} />
                Most Popular
              </Badge>
            </div>
          )}

          {/* Header */}
          <div className="flex justify-between items-center mb-3 sm:mb-5">
            <h3 className={`font-semibold text-primary`}>
              {planKey[0].toUpperCase() + planKey.slice(1)}
            </h3>
            <div className="flex-shrink-0">
              {planIcons[planKey] || planIcons.Professional}
            </div>
          </div>

          {/* Price */}
          <div className="text-foreground mb-2">
            <h4 className="inline-flex text-5xl font-semibold">
              <div className="inline-flex flex-wrap items-center gap-3">
                <div className="inline-flex flex-wrap items-center">
                  <span className="text-2xl self-start me-1">$</span>
                  {plan.displayPrice}
                </div>
              </div>
            </h4>
            <p className="text-sm text-muted-foreground">one time cost</p>
          </div>

          {/* Description */}
          <div className="mb-5">
            <p className="sm:min-h-[40px] text-sm text-muted-foreground">
              {plan.description}
            </p>
          </div>

          {/* Quantity Selector */}
          <div className="space-y-2 text-center mb-5">
            <Label className="text-xs font-medium">Quantity</Label>
            <div className="flex items-center justify-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  updateQuantity(planKey, -1);
                }}
                disabled={quantity <= (planKey === "team" ? 2 : 1)}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setDirectQuantity(planKey, e.target.value)}
                className="w-16 text-center font-medium"
                min={planKey === "team" ? 2 : 1}
                onClick={(e) => e.stopPropagation()}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  updateQuantity(planKey, 1);
                }}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {planKey === "team" && (
              <p className="text-xs text-muted-foreground text-center">
                Minimum 2 credits required
              </p>
            )}
          </div>

          {/* Volume Discounts for Team Plan */}
          {planKey === "team" && (
            <div className="space-y-3 mb-5">
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2 justify-center">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <Label className="text-xs font-medium">
                    Volume Discounts
                  </Label>
                </div>
                <div className="space-y-1">
                  {TEAM_VOLUME_DISCOUNTS.filter(
                    (tier) => tier.discount > 0
                  ).map((tier) => (
                    <div
                      key={tier.minQuantity}
                      className={`flex justify-between items-center text-xs px-2 py-1 rounded ${
                        quantity >= tier.minQuantity
                          ? "bg-success/10 text-success border border-success/30"
                          : "text-muted-foreground"
                      }`}
                    >
                      <span>{tier.minQuantity}+ credits:</span>
                      <Badge
                        variant={
                          quantity >= tier.minQuantity ? "default" : "secondary"
                        }
                        className={`text-xs ${
                          quantity >= tier.minQuantity
                            ? "bg-success text-success-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {(tier.discount * 100).toFixed(0)}% OFF
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Current Discount Alert */}
          {planKey === "team" && quantity >= 5 && (
            <div className="flex items-center gap-2 p-3 rounded-lg border border-success/30 bg-success/10">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span className="text-success text-sm">
                🎉 You're saving ${pricing.savings} with {pricing.discount}%
                volume discount!
              </span>
            </div>
          )}

          {/* Buy Button */}
          <button
            className={`py-3 px-4 w-full inline-flex justify-center items-center gap-x-1 text-sm font-semibold rounded-lg border border-transparent ${getPlanButtonStyle(
              planKey
            )}`}
            onClick={(e) => {
              e.stopPropagation();
              handleCheckout(planKey);
            }}
            disabled={isLoading}
          >
            {isLoading && selectedPlan === planKey
              ? "Processing..."
              : `Pay $${parseInt(pricing.total).toFixed(0)} & Create`}
          </button>

          {/* Features List */}
          <ul className="mt-6 space-y-4">
            {plan.features.slice(0, 8).map((feature, index) => {
              return (
                <li key={index} className="flex space-x-4">
                  <Check className="flex-shrink-0 mt-0.5 h-4 w-4 text-success" />
                  <span className="text-sm text-foreground">{feature}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    );
  };

  // ===== RENDER FULL-WIDTH TEAM PLAN CARD =====
  const renderFullWidthTeamCard = (planKey, plan) => {
    const quantity = quantities[planKey] || 1;
    const pricing = getPlanPricing(planKey, quantity);

    return (
      <div
        key={planKey}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-5"
      >
        {/* Card 1: What's Included */}
        <div
          key={`${planKey}-features`}
          className="flex flex-col rounded-2xl relative z-1"
        >
          <div className="min-h-full p-6 md:p-7 bg-white rounded-[14px]">
            {/* Header */}
            <div className="flex justify-between items-center mb-3 sm:mb-5">
              <h3 className={`font-semibold text-primary`}>What's Included</h3>
              <div className="flex-shrink-0">{planIcons[planKey]}</div>
            </div>

            {/* Features List */}
            <ul className="mt-6 space-y-4">
              {plan.features.slice(0, 8).map((feature, index) => (
                <li key={index} className="flex space-x-4">
                  <Check className="flex-shrink-0 mt-0.5 h-4 w-4 text-success" />
                  <span className="text-sm text-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Card 2: Quantity & Buy */}
        <div
          key={`${planKey}-quantity`}
          className="flex flex-col rounded-2xl relative z-1"
          onClick={() => handlePlanSelect(planKey)}
        >
          <div className="min-h-full p-6 md:p-7 bg-white rounded-[14px]">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge
                variant="secondary"
                className="bg-primary/10 text-primary text-xs font-semibold"
              >
                <TrendingUp className="mr-1 size-3" strokeWidth={2.5} />
                For Growing Teams
              </Badge>
            </div>

            {/* Header */}
            <div className="flex justify-between items-center mb-3 sm:mb-5">
              <h3 className={`font-semibold text-primary`}>
                {planKey[0].toUpperCase() + planKey.slice(1)}
              </h3>
              <div className="flex-shrink-0">{planIcons[planKey]}</div>
            </div>

            {/* Price */}
            <div className="text-foreground mb-2">
              <h4 className="inline-flex text-5xl font-semibold">
                <div className="inline-flex flex-wrap items-center gap-3">
                  <div className="inline-flex flex-wrap items-center">
                    <span className="text-2xl self-start me-1">$</span>
                    {plan.displayPrice}
                  </div>
                </div>
              </h4>
              <p className="text-sm text-muted-foreground">
                one time cost/member
              </p>
            </div>

            {/* Description */}
            <div className="mb-5">
              <p className="sm:min-h-[40px] text-sm text-muted-foreground">
                {plan.description}
              </p>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-2 text-center mb-5">
              <Label className="text-xs font-medium">Quantity</Label>
              <div className="flex items-center justify-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateQuantity(planKey, -1);
                  }}
                  disabled={quantity <= 2}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setDirectQuantity(planKey, e.target.value)}
                  className="w-16 text-center font-medium"
                  min={2}
                  onClick={(e) => e.stopPropagation()}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateQuantity(planKey, 1);
                  }}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Minimum 2 credits required
              </p>
            </div>

            {/* Current Discount Alert */}
            {quantity >= 5 && (
              <div className="flex items-center gap-2 p-3 rounded-lg border border-success/30 bg-success/10 mb-5">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span className="text-success text-sm">
                  You're saving ${pricing.savings} with {pricing.discount}%
                  volume discount!
                </span>
              </div>
            )}

            {/* Total */}
            <div className="text-center mb-5">
              <div className="text-xl font-bold">
                Total: ${pricing.total}
                {pricing.savings > 0 && (
                  <div className="text-sm font-normal text-success">
                    (Save ${pricing.savings})
                  </div>
                )}
              </div>
            </div>

            {/* Buy Button */}
            <button
              className={`py-3 px-4 w-full inline-flex justify-center items-center gap-x-1 text-sm font-semibold rounded-lg border border-transparent bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:bg-primary/90`}
              onClick={(e) => {
                e.stopPropagation();
                handleCheckout(planKey);
              }}
              disabled={isLoading}
            >
              {isLoading && selectedPlan === planKey
                ? "Processing..."
                : `Create Headshots`}
            </button>
          </div>
        </div>

        {/* Card 3: Volume Discounts & Enterprise */}
        <div
          key={`${planKey}-discounts`}
          className="flex flex-col rounded-2xl relative z-1"
        >
          <div className="min-h-full p-6 md:p-7 bg-white rounded-[14px]">
            {/* Header */}
            <div className="flex justify-between items-center mb-3 sm:mb-5">
              <h3 className={`font-semibold text-primary`}>Volume Discounts</h3>
              <div className="flex-shrink-0">{planIcons[planKey]}</div>
            </div>

            {/* Volume Discounts */}
            <div className="space-y-3 mb-6">
              {TEAM_VOLUME_DISCOUNTS.filter((tier) => tier.discount > 0).map(
                (tier) => (
                  <div
                    key={tier.minQuantity}
                    className={`flex justify-between items-center text-xs px-2 py-1 rounded text-muted-foreground`}
                  >
                    <span>{tier.minQuantity}+ credits:</span>
                    <Badge
                      variant={
                        quantity >= tier.minQuantity ? "default" : "secondary"
                      }
                      className={`text-xs ${
                        quantity >= tier.minQuantity
                          ? "bg-success text-success-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {(tier.discount * 100).toFixed(0)}% OFF
                    </Badge>
                  </div>
                )
              )}
            </div>

            {/* Enterprise Section */}
            <div className="border-t pt-4">
              <h4 className="font-semibold text-primary mb-3">
                Enterprise Solutions
              </h4>
              <p className="text-sm text-muted-foreground mb-4">
                Need custom enterprise solutions with bulk pricing, white-label
                options, logo placement on outfits, human retouching, or API
                access?
              </p>
              {/* <Link
                href="mailto:support@proshoot.co"
                className="inline-flex items-center text-sm text-primary hover:text-primary/80"
              >
                Contact Sales
              </Link> */}
              <Button variant={"outline"} size={"sm"} asChild>
                <Link href="mailto:support@proshoot.co">Contact Sales</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ===== MAIN RENDER =====
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-2">Choose Your Plan</h1>
        <p className="text-muted-foreground">
          Professional AI headshots for individuals and teams
        </p>
      </div>

      {/* Main Layout */}
      <div className="space-y-8">
        {/* Plans Section */}
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          {/* Centered Tab Selector */}
          <div className="flex justify-center mb-8">
            <TabsList className="grid grid-cols-2 w-80">
              <TabsTrigger value="personal" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Personal
              </TabsTrigger>
              <TabsTrigger
                value="organization"
                className="flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                Organization
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Personal Plans */}
          <TabsContent value="personal" className="mt-0">
            <div className="space-y-8">
              {/* Plans Grid - New Styled Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-5">
                {Object.entries(getAvailablePlans("personal")).map(
                  ([planKey, plan]) => renderPlanCard(planKey, plan)
                )}
              </div>
            </div>
          </TabsContent>

          {/* Organization Plans */}
          <TabsContent value="organization" className="mt-0">
            <div className="space-y-8">
              {/* Team Plan - Full Width */}
              <div className="w-full">
                {Object.entries(getAvailablePlans("organization")).map(
                  ([planKey, plan]) => renderFullWidthTeamCard(planKey, plan)
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
