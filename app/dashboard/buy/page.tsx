"use client";

import React, { useState, useEffect } from "react";
import { useAccountContext } from "@/context/AccountContext";
import { ContentLayout } from "@/components/dashboard/sidebar/content-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createCheckout } from "@lemonsqueezy/lemonsqueezy.js";
import config from "@/config";

// Define bulk discount tiers
const BULK_DISCOUNT_TIERS = [
  { minCredits: 5, discount: 0.1 }, // 10% off for 5+ credits
  { minCredits: 10, discount: 0.2 }, // 20% off for 10+ credits
  { minCredits: 25, discount: 0.3 }, // 30% off for 25+ credits
  { minCredits: 50, discount: 0.4 }, // 40% off for 50+ credits
  { minCredits: 100, discount: 0.5 }, // 50% off for 100+ credits
];

// Base price per credit
const BASE_PRICE_PER_CREDIT = 9.99;

export default function BuyCreditsPage() {
  // All hooks must be called at the top level, before any conditional returns
  const router = useRouter();
  const { selectedContext, userId } = useAccountContext();
  const [creditAmount, setCreditAmount] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValidContext, setIsValidContext] = useState(false);
  const [isContextChecked, setIsContextChecked] = useState(false);

  // Effect to check context validity
  useEffect(() => {
    const checkContext = async () => {
      if (!selectedContext) {
        setIsContextChecked(true);
        return;
      }

      if (selectedContext.type !== "organization") {
        setIsValidContext(false);
        router.push("/dashboard");
      } else {
        setIsValidContext(true);
      }
      setIsContextChecked(true);
    };

    checkContext();
  }, [selectedContext, router]);

  // Calculate price with bulk discount
  const calculatePrice = (credits: number) => {
    const applicableTier = [...BULK_DISCOUNT_TIERS]
      .reverse()
      .find((tier) => credits >= tier.minCredits);

    const discount = applicableTier?.discount || 0;
    const basePrice = credits * BASE_PRICE_PER_CREDIT;
    const discountedPrice = basePrice * (1 - discount);

    return {
      originalPrice: basePrice.toFixed(2),
      discountedPrice: discountedPrice.toFixed(2),
      discount: (discount * 100).toFixed(0),
      savings: (basePrice - discountedPrice).toFixed(2),
    };
  };

  const handleCreditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= 500) {
      setCreditAmount(value);
    }
  };

  const handleBuyCredits = async () => {
    if (!isValidContext || !selectedContext || !userId) {
      setError("Invalid context or user");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { discountedPrice } = calculatePrice(creditAmount);

      const checkout = await createCheckout(
        process.env.NEXT_PUBLIC_LEMONSQUEEZY_STORE_ID || "000",
        config.PLANS.Team.variantId,
        {
          checkoutData: {
            custom: {
              user_id: userId,
              organization_id: selectedContext.id,
              credit_amount: creditAmount.toString(),
              credit_type: "team",
            },
          },
          productOptions: {
            name: `${creditAmount} Team Credits`,
            description: `Purchase ${creditAmount} team credits for your organization`,
            redirectUrl: `${window.location.origin}/dashboard/organization?org_id=${selectedContext.id}&payment_status=success`,
          },
          checkoutOptions: {
            embed: false,
            media: false,
            logo: true,
          },
        }
      );

      if (!checkout?.data?.data?.attributes?.url) {
        throw new Error("Invalid checkout response");
      }

      window.location.href = checkout.data.data.attributes.url;
    } catch (err) {
      console.error("Checkout error:", err);
      setError("Failed to create checkout session. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const priceDetails = calculatePrice(creditAmount);

  // Render loading state while checking context
  if (!isContextChecked) {
    return (
      <ContentLayout navbar={false} title="Buy Team Credits">
        <div className="max-w-2xl mx-auto mt-8">
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">Loading...</p>
            </CardContent>
          </Card>
        </div>
      </ContentLayout>
    );
  }

  // Render invalid context message
  if (!isValidContext) {
    return (
      <ContentLayout navbar={false} title="Buy Team Credits">
        <div className="max-w-2xl mx-auto mt-8">
          <Card>
            <CardContent className="p-6">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Invalid Context</AlertTitle>
                <AlertDescription>
                  You must be in an organization context to purchase team
                  credits.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </ContentLayout>
    );
  }

  // Main content render
  return (
    <ContentLayout navbar={false} title="Buy Team Credits">
      <div className="max-w-2xl mx-auto mt-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Buy Credits for Your Organization</CardTitle>
            <CardDescription>
              Purchase credits to create professional headshots for your entire
              team. The more credits you buy, the more you save!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="credits">Number of Credits</Label>
                <Input
                  id="credits"
                  type="number"
                  min="1"
                  max="500"
                  value={creditAmount}
                  onChange={handleCreditChange}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground">
                  Enter between 1 and 500 credits
                </p>
              </div>

              {priceDetails.discount !== "0" && (
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>Bulk Discount Applied!</AlertTitle>
                  <AlertDescription>
                    You're saving {priceDetails.discount}% on your purchase!
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2 p-4 bg-muted rounded-lg">
                <div className="flex justify-between">
                  <span>Original Price:</span>
                  <span>${priceDetails.originalPrice}</span>
                </div>
                {priceDetails.discount !== "0" && (
                  <>
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({priceDetails.discount}%):</span>
                      <span>-${priceDetails.savings}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>Final Price:</span>
                      <span>${priceDetails.discountedPrice}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleBuyCredits}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Processing..." : "Proceed to Checkout"}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bulk Discount Tiers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {BULK_DISCOUNT_TIERS.map((tier) => (
                <div key={tier.minCredits} className="flex justify-between">
                  <span>{tier.minCredits}+ Credits:</span>
                  <span className="text-green-600">
                    {tier.discount * 100}% OFF
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </ContentLayout>
  );
}
