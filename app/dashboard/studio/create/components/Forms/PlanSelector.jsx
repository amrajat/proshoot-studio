"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Check } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import config from "@/config";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAccountContext } from "@/context/AccountContext";
import Heading from "@/components/shared/heading";
import { useRouter } from "next/navigation";

// Define which plans are available per context
const PERSONAL_PLANS = ["starter", "pro", "studio"];
const ORG_PLANS = ["team"];

export default function PlanSelector({
  data,
  isPending,
  credits = null,
  register,
  setValue,
  errors,
  watch,
  clearErrors,
  trigger,
  shouldValidate,
  isOrgContext,
}) {
  // All hooks must be called at the top level
  const router = useRouter();
  const { userId } = useAccountContext();
  const [localValue, setLocalValue] = useState("");
  const [details, _] = data;

  // Memoized values
  const availablePlans = useMemo(() => {
    const allPlans = Object.entries(config.PLANS);
    return allPlans.filter(([planName]) => {
      const normalizedPlanName = planName.toLowerCase();
      return isOrgContext
        ? ORG_PLANS.includes(normalizedPlanName)
        : PERSONAL_PLANS.includes(normalizedPlanName);
    });
  }, [isOrgContext]);

  const hasZeroTeamCredits = useMemo(() => {
    if (!isOrgContext || !credits) return false;
    return credits.team === 0;
  }, [isOrgContext, credits]);

  // Register field with react-hook-form
  useEffect(() => {
    if (register) {
      register(details.fieldName, {
        required: `Please select a ${details.title.toLowerCase()}.`,
        validate: (value) =>
          value !== "" || `Please select a ${details.title.toLowerCase()}.`,
      });
    }
  }, [register, details.fieldName, details.title]);

  const handleRadioChange = (value) => {
    setLocalValue(value);
    if (setValue) {
      setValue(details.fieldName, value, { shouldValidate });
    }
    if (clearErrors) {
      clearErrors(details.fieldName);
    }
  };

  const currentValue = watch ? watch(details.fieldName) : localValue;

  // Render content based on conditions
  const renderContent = () => {
    if (availablePlans.length === 0) {
      return (
        <div className="space-y-4">
          <Badge variant="destructive" className="mb-2 uppercase">
            No Plans Available
          </Badge>
          <Heading variant={"hero"}>{details.title}</Heading>
          <p className="text-muted-foreground">
            {isOrgContext
              ? "No team plans are currently available for organizations."
              : "No personal plans are currently available."}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <Badge variant="destructive" className="mb-2 uppercase">
          This field is required
        </Badge>
        <Heading variant={"hero"}>{details.title}</Heading>
        <p className="text-muted-foreground">{details.subtitle}</p>
        <RadioGroup
          onValueChange={handleRadioChange}
          value={currentValue}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        >
          {availablePlans.map(([planName, planDetails]) => {
            const randomKey = uuidv4();
            const planCredits = credits
              ? credits[planName.toLowerCase()] ?? 0
              : 0;
            const isDisabled = isOrgContext && planCredits <= 0;

            return (
              <Card
                key={randomKey}
                className={`relative rounded ${
                  currentValue === planName ? "border-primary" : "border-border"
                } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <CardContent className="p-4">
                  <RadioGroupItem
                    value={planName}
                    id={randomKey}
                    disabled={isDisabled}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={randomKey}
                    className={`flex flex-col space-y-1 ${
                      isDisabled ? "cursor-not-allowed" : "cursor-pointer"
                    }`}
                  >
                    <span className="font-medium">{planName}</span>
                    <span className="text-sm text-muted-foreground">
                      {planCredits} credits available
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {planDetails?.headshots} Headshots
                    </span>
                  </Label>
                  {currentValue === planName && (
                    <Check className="absolute top-4 right-4 text-primary" />
                  )}
                </CardContent>
              </Card>
            );
          })}
        </RadioGroup>
        {shouldValidate && errors && errors[details?.fieldName]?.message && (
          <p className="text-sm text-destructive">
            {errors[details?.fieldName].message}
          </p>
        )}
      </div>
    );
  };

  return (
    <fieldset disabled={isPending} className="space-y-4">
      {renderContent()}
    </fieldset>
  );
}
