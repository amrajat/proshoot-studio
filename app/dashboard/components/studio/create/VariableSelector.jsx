"use client";

import React, { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Heading from "@/components/shared/heading";

export default function VariableSelector({
  data,
  isSubmitting,
  register,
  setValue,
  errors,
  watch,
  clearErrors,
  trigger,
  shouldValidate,
}) {
  const [
    details,
    options,
    {
      isRequired,
      placeholderText,
      helpText,
      regexPattern,
      radioOptions,
      customOption,
    },
  ] = data;
  const [useCustomInput, setUseCustomInput] = useState(false);
  const [localValue, setLocalValue] = useState("");

  const handleCustomInputChange = (e) => {
    const customValue = e.target.value;
    setUseCustomInput(customValue !== "");
    setLocalValue(customValue);
    if (setValue) {
      setValue(details.fieldName, customValue, { shouldValidate });
    }
    if (clearErrors) {
      clearErrors(details.fieldName);
    }
  };

  const handleRadioChange = (value) => {
    setUseCustomInput(false);
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
    <fieldset disabled={isSubmitting} className="space-y-4">
      <Heading variant={"hero"}>{details.title}</Heading>
      <p className="text-muted-foreground">{details.subtitle}</p>
      {radioOptions && options && (
        <RadioGroup
          onValueChange={handleRadioChange}
          value={currentValue}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        >
          {Object.entries(options).map(([optionName, optionValue]) => {
            const randomKey = uuidv4();
            return (
              <Card
                key={randomKey}
                className={`relative rounded cursor-pointer ${
                  currentValue === optionValue
                    ? "border-primary"
                    : "border-border"
                }`}
                onClick={() => handleRadioChange(optionValue)}
              >
                <CardContent className="p-4">
                  <RadioGroupItem
                    value={optionValue}
                    id={randomKey}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={randomKey}
                    className="flex items-center justify-between cursor-pointer font-normal"
                  >
                    <span>{optionValue}</span>
                    {currentValue === optionValue && (
                      <Check className="text-primary transition-opacity duration-200 ease-in-out" />
                    )}
                  </Label>
                </CardContent>
              </Card>
            );
          })}
        </RadioGroup>
      )}
      {customOption && (
        <div className="space-y-2">
          <Label htmlFor="custom-input">
            Enter your {radioOptions ? "custom" : ""} value here:
          </Label>
          <Input
            id="custom-input"
            type="text"
            placeholder={placeholderText || "Enter your custom value here"}
            onChange={handleCustomInputChange}
            onFocus={() => setUseCustomInput(true)}
            onBlur={(e) => setUseCustomInput(e.target.value !== "")}
            value={useCustomInput ? currentValue || "" : ""}
          />
          {helpText && (
            <p className="text-sm text-muted-foreground">{helpText}</p>
          )}
        </div>
      )}
      {shouldValidate && errors && errors[details?.fieldName]?.message && (
        <p className="text-sm text-destructive">
          {errors[details?.fieldName].message}
        </p>
      )}
    </fieldset>
  );
}
