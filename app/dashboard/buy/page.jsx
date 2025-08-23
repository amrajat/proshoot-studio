"use client";

import React, { useState, useEffect } from "react";
import { useAccountContext } from "@/context/AccountContext";
import { useRouter } from "next/navigation";
import { createCheckoutUrl } from "@/app/dashboard/actions/checkout";
import config from "@/config";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertCircle,
  CheckCircle2,
  Users,
  User,
  Crown,
  Minus,
  Plus,
} from "lucide-react";
import Link from "next/link";

// ===== TEAM PLAN VOLUME DISCOUNTS =====
const TEAM_VOLUME_DISCOUNTS = [
  { minQuantity: 2, discount: 0 },
  { minQuantity: 5, discount: 0.1 },
  { minQuantity: 25, discount: 0.2 },
  { minQuantity: 100, discount: 0.3 },
];

/**
 * High-Converting Buy Credits Page
 *
 * Features:
 * - Personal/Organization context switching
 * - Dynamic plan rendering from config.js
 * - Quantity selection with volume discounts
 * - Order summary and conversion optimization
 * - Team plan minimum quantity enforcement
 */
export default function BuyCreditsPage() {
  // ===== HOOKS =====
  const router = useRouter();
  const { selectedContext, userId } = useAccountContext();

  // ===== STATE MANAGEMENT =====
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [quantities, setQuantities] = useState({});
  const [selectedPlan, setSelectedPlan] = useState("");
  const [activeTab, setActiveTab] = useState("personal");

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

  const calculatePlanTotal = (planKey, quantity) => {
    const plan = config.PLANS[planKey];
    if (!plan) return { total: 0, discount: 0, savings: 0 };

    const baseTotal = plan.planPrice * quantity;
    let discount = 0;

    // Apply volume discount for team plans
    if (planKey === "team" && quantity >= 2) {
      const applicableDiscount = [...TEAM_VOLUME_DISCOUNTS]
        .reverse()
        .find((tier) => quantity >= tier.minQuantity);
      discount = applicableDiscount?.discount || 0;
    }

    const savings = baseTotal * discount;
    const total = baseTotal - savings;

    return {
      baseTotal: baseTotal.toFixed(2),
      total: total.toFixed(2),
      discount: (discount * 100).toFixed(0),
      savings: savings.toFixed(2),
    };
  };

  const updateQuantity = (planKey, change) => {
    setQuantities((prev) => {
      const currentQty = prev[planKey] || 1;
      const newQty = Math.max(planKey === "team" ? 2 : 1, currentQty + change);
      return { ...prev, [planKey]: Math.min(newQty, 100) };
    });
  };

  const handlePlanSelect = (planKey) => {
    setSelectedPlan(planKey);
    setError(null);
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
    setError("");

    try {
      const quantity = quantities[planKey] || 1;

      // Create checkout URL with proper custom data (user auth handled server-side)
      const checkoutUrl = await createCheckoutUrl(
        planKey,
        quantity,
        {
          source: "buy_page",
          plan_price: config.PLANS[planKey].planPrice,
          total_amount: calculatePlanTotal(planKey, quantity).total,
        },
        `${window.location.origin}/dashboard/studio/create?payment=success&plan=${planKey}&quantity=${quantity}`
      );

      if (checkoutUrl) {
        // Direct redirect to LemonSqueezy checkout for maximum conversion
        window.location.href = checkoutUrl;
      } else {
        throw new Error("Failed to create checkout URL");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setError(`Checkout failed: ${error.message}`);
      setIsLoading(false);
      setSelectedPlan("");
    }
  };

  // ===== RENDER PLAN CARD =====
  const renderPlanCard = (planKey, plan) => {
    const quantity = quantities[planKey] || 1;
    const pricing = calculatePlanTotal(planKey, quantity);
    const isSelected = selectedPlan === planKey;

    return (
      <Card
        key={planKey}
        className={`relative cursor-pointer transition-all duration-200 ${
          isSelected
            ? "ring-2 ring-primary shadow-lg"
            : "hover:shadow-md hover:border-primary/50"
        }`}
        onClick={() => handlePlanSelect(planKey)}
      >
        {plan.mostPopular && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
              <Crown className="w-3 h-3 mr-1" />
              Most Popular
            </Badge>
          </div>
        )}

        <CardHeader className="text-center pb-4">
          <CardTitle className="capitalize text-xl">{planKey}</CardTitle>
          <div className="space-y-1">
            <div className="text-3xl font-bold">${plan.planPrice}</div>
            <p className="text-sm text-muted-foreground">per credit</p>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Quantity Selector */}
          <div className="space-y-2 text-center">
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
              <span className="w-12 text-center font-medium">{quantity}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  updateQuantity(planKey, 1);
                }}
                disabled={quantity >= 100}
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
            <div className="space-y-3">
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
                          ? "bg-green-50 text-green-800 border border-green-200"
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
                            ? "bg-green-600 text-white"
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
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-800 text-sm">
                🎉 You're saving ${pricing.savings} with {pricing.discount}%
                volume discount!
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="pt-4">
          <Button
            onClick={() => handleCheckout(planKey)}
            disabled={isLoading}
            className="w-full"
            size="lg"
            variant={isSelected ? "default" : "outline"}
          >
            {isLoading && selectedPlan === planKey
              ? "Processing..."
              : `Buy ${planKey[0].toUpperCase() + planKey.slice(1)} Plan - $${
                  pricing.total
                }`}
          </Button>
        </CardFooter>
      </Card>
    );
  };

  // ===== RENDER FULL-WIDTH TEAM PLAN CARD =====
  const renderFullWidthTeamCard = (planKey, plan) => {
    const quantity = quantities[planKey] || 1;
    const pricing = calculatePlanTotal(planKey, quantity);
    const isSelected = selectedPlan === planKey;

    return (
      <Card
        key={planKey}
        className="relative w-full max-w-7xl mx-auto"
        onClick={() => setSelectedPlan(planKey)}
      >
        {plan.mostPopular && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
              <Crown className="w-3 h-3 mr-1" />
              Most Popular
            </Badge>
          </div>
        )}

        <CardContent className="p-6">
          {/* Header Section */}
          <div className="text-center mb-6">
            <CardTitle className="capitalize text-2xl font-bold mb-2">
              {planKey} Plan
            </CardTitle>
            <div className="text-3xl font-bold mb-1">${plan.planPrice}</div>
            <div className="text-primary mb-3">per credit</div>
            <p className="text-muted-foreground text-sm">
              Perfect for teams and organizations looking for professional AI
              headshots at scale
            </p>
          </div>

          {/* Three Column Layout: What's Included | Quantity | Volume Discounts */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {/* What's Included Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-center">
                What's Included
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </div>
                    <span className="text-muted-foreground text-sm leading-relaxed">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quantity Section - Centered */}
            <div className="text-center md:col-span-2 lg:col-span-1 md:order-2 lg:order-2">
              <h3 className="text-lg font-semibold mb-3">Quantity</h3>
              <div className="flex items-center justify-center gap-3 mb-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateQuantity(planKey, -1);
                  }}
                  disabled={quantity <= 2}
                  className="h-8 w-8"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <input
                  type="number"
                  min="2"
                  max="100"
                  value={quantity}
                  onChange={(e) => {
                    e.stopPropagation();
                    const newQuantity = parseInt(e.target.value) || 2;
                    if (newQuantity >= 2 && newQuantity <= 100) {
                      setQuantities((prev) => ({
                        ...prev,
                        [planKey]: newQuantity,
                      }));
                    }
                  }}
                  className="text-xl font-semibold w-16 text-center border rounded px-2 py-1 bg-background"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateQuantity(planKey, 1);
                  }}
                  disabled={quantity >= 100}
                  className="h-8 w-8"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <p className="text-xs text-primary mb-4">
                Minimum 2 credits required
              </p>

              {/* Current Discount Alert */}
              {quantity >= 5 && (
                <Alert className="border-green-200 bg-green-50 mb-4">
                  <CheckCircle2 className="w-3 h-3 text-green-600" />
                  <AlertDescription className="text-green-800 text-xs">
                    🎉 You're saving ${pricing.savings} with {pricing.discount}%
                    volume discount!
                  </AlertDescription>
                </Alert>
              )}

              {/* Total and Purchase - Under Quantity */}
              <div className="space-y-3">
                <div className="text-xl font-bold">
                  Total: ${pricing.total}
                  {pricing.savings > 0 && (
                    <div className="text-sm font-normal text-muted-foreground">
                      (Save ${pricing.savings})
                    </div>
                  )}
                </div>
                <Button
                  onClick={() => handleCheckout(planKey)}
                  disabled={isLoading}
                  className="w-full"
                  size="lg"
                >
                  {isLoading && selectedPlan === planKey
                    ? "Processing..."
                    : `Buy ${planKey[0].toUpperCase() + planKey.slice(1)} Plan`}
                </Button>
              </div>
            </div>

            {/* Volume Discounts Section */}
            <div className="md:order-1 lg:order-3">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Users className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold">Volume Discounts</h3>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {TEAM_VOLUME_DISCOUNTS.filter((tier) => tier.discount > 0).map(
                  (tier) => (
                    <div
                      key={tier.minQuantity}
                      className={`text-center p-2 rounded ${
                        quantity >= tier.minQuantity
                          ? "bg-green-50 border border-green-200"
                          : "bg-muted"
                      }`}
                    >
                      <div className="text-xs font-medium text-muted-foreground">
                        {tier.minQuantity}+ credits:
                      </div>
                      <div
                        className={`text-sm font-bold ${
                          quantity >= tier.minQuantity
                            ? "text-green-600"
                            : "text-muted-foreground"
                        }`}
                      >
                        {(tier.discount * 100).toFixed(0)}% OFF
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Enterprise Section - Centered */}
          <div className="border-t pt-4">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">
                Need custom enterprise solutions?
                <Link
                  href="mailto:support@proshoot.co"
                  variant="link"
                  className="p-0 h-auto text-sm underline ml-1"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
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

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="max-w-2xl mx-auto mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

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
                <TabsTrigger
                  value="personal"
                  className="flex items-center gap-2"
                >
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
                {/* Plans Grid */}
                <div
                  className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
                  id="personal-plans-grid"
                >
                  {Object.entries(getAvailablePlans("personal")).map(
                    ([planKey, plan]) => renderPlanCard(planKey, plan)
                  )}
                </div>

                {/* Selected Plan Features - Full Width Below Plans */}
                {selectedPlan && activeTab === "personal" && (
                  <div className="w-full">
                    <Card>
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg capitalize text-center">
                          {selectedPlan} Features
                        </CardTitle>
                        <CardDescription className="text-sm text-center">
                          What's included in your plan
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                          {config.PLANS[selectedPlan].features.map(
                            (feature, index) => (
                              <div
                                key={index}
                                className="flex items-start text-sm"
                              >
                                <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                <span>{feature}</span>
                              </div>
                            )
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
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
