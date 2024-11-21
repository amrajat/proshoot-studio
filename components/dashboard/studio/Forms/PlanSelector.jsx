"use client";

import React, { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import config from "@/config";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Heading from "@/components/shared/heading";

export default function PlanSelector({
  data,
  isPending,
  register,
  setValue,
  errors,
  watch,
  clearErrors,
  trigger,
  shouldValidate,
}) {
  const [details, options] = data;
  const [localValue, setLocalValue] = useState("");

  const handleRadioChange = (value) => {
    setLocalValue(value);
    if (setValue) {
      setValue(details.fieldName, value, { shouldValidate });
    }
    if (clearErrors) {
      clearErrors(details.fieldName);
    }
  };

  useEffect(() => {
    if (register) {
      register(details.fieldName, {
        required: `Please select a ${details.title.toLowerCase()}.`,
        validate: (value) =>
          value !== "" || `Please select a ${details.title.toLowerCase()}.`,
      });
    }
  }, [register, details.fieldName, details.title]);

  const currentValue = watch ? watch(details.fieldName) : localValue;

  return (
    <fieldset disabled={isPending} className="space-y-4">
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
        {options.map(([planName, remainingCredits]) => {
          const randomKey = uuidv4();
          return (
            <Card
              key={randomKey}
              className={`relative rounded ${
                currentValue === planName ? "border-primary" : "border-border"
              }`}
            >
              <CardContent className="p-4">
                <RadioGroupItem
                  value={planName}
                  id={randomKey}
                  disabled={remainingCredits < 1}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={randomKey}
                  className="flex flex-col space-y-1 cursor-pointer"
                >
                  <span className="font-medium">{planName}</span>
                  <span className="text-sm text-muted-foreground">
                    {remainingCredits} credits available
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {config.PLANS[planName]?.headshots} Headshots
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
    </fieldset>
  );
}
