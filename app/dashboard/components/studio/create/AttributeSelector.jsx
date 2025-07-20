"use client";

import React, { useEffect } from "react";
import { Controller } from "react-hook-form";
import { ATTRIBUTES } from "./Variables";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import Heading from "@/components/shared/heading";
import { Badge } from "@/components/ui/badge";

const AttributeSelect = ({
  control,
  fieldName,
  label,
  options,
  error,
  isSubmitting,
}) => (
  <div className="space-y-2">
    <Label htmlFor={fieldName}>{label}</Label>
    <Controller
      name={fieldName}
      control={control}
      render={({ field }) => (
        <Select
          onValueChange={field.onChange}
          defaultValue={field.value}
          disabled={isSubmitting}
        >
          <SelectTrigger id={fieldName}>
            <SelectValue placeholder={`Select ${label}`} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    />
    {error && <p className="text-sm text-destructive">{error.message}</p>}
  </div>
);

export default function AttributeSelector({
  control,
  watch,
  setValue,
  formState,
  isSubmitting,
  register,
}) {
  const { errors } = formState;
  const gender = watch("gender");
  const hairLength = watch("hairLength");

  useEffect(() => {
    if (hairLength === "Bald") {
      setValue("hairColor", "", { shouldValidate: false });
      setValue("hairType", "", { shouldValidate: false });
    }
  }, [hairLength, setValue]);

  const getHairOptions = (attribute) => {
    if (!gender || !attribute[gender]) {
      return attribute["non-binary"] || []; // Default to non-binary or empty
    }
    return attribute[gender];
  };

  return (
    <fieldset disabled={isSubmitting} className="space-y-6">
      <div className="space-y-2">
        <Heading variant={"hero"}>Customize Your Attributes</Heading>
        <p className="text-muted-foreground">
          Select the options that best describe you to generate the perfect
          headshots.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="space-y-2">
          <Label htmlFor="studioName">{ATTRIBUTES.studioName.label}</Label>
          <Input
            id="studioName"
            {...register("studioName")}
            placeholder={ATTRIBUTES.studioName.description}
            disabled={isSubmitting}
          />
          {errors.studioName && (
            <p className="text-sm text-destructive">
              {errors.studioName.message}
            </p>
          )}
        </div>
        <AttributeSelect
          control={control}
          fieldName="age"
          label="Age Range"
          options={ATTRIBUTES.age.options}
          error={errors.age}
          isSubmitting={isSubmitting}
        />
        <AttributeSelect
          control={control}
          fieldName="ethnicity"
          label="Ethnicity"
          options={ATTRIBUTES.ethnicity.options}
          error={errors.ethnicity}
          isSubmitting={isSubmitting}
        />
        <AttributeSelect
          control={control}
          fieldName="hairLength"
          label="Hair Length"
          options={getHairOptions(ATTRIBUTES.hairLength.options)}
          error={errors.hairLength}
          isSubmitting={isSubmitting}
        />
        <AttributeSelect
          control={control}
          fieldName="hairColor"
          label="Hair Color"
          options={getHairOptions(ATTRIBUTES.hairColor.options)}
          error={errors.hairColor}
          isSubmitting={isSubmitting || hairLength === "Bald"}
        />
        <AttributeSelect
          control={control}
          fieldName="hairType"
          label="Hair Type"
          options={getHairOptions(ATTRIBUTES.hairType.options)}
          error={errors.hairType}
          isSubmitting={isSubmitting || hairLength === "Bald"}
        />
        <AttributeSelect
          control={control}
          fieldName="glasses"
          label="Wear Glasses?"
          options={ATTRIBUTES.glasses.options}
          error={errors.glasses}
          isSubmitting={isSubmitting}
        />
        <AttributeSelect
          control={control}
          fieldName="eyeColor"
          label="Eye Color"
          options={ATTRIBUTES.eyeColor.options}
          error={errors.eyeColor}
          isSubmitting={isSubmitting}
        />
        <AttributeSelect
          control={control}
          fieldName="bodyType"
          label="Body Type"
          options={getHairOptions(ATTRIBUTES.bodyType.options)}
          error={errors.bodyType}
          isSubmitting={isSubmitting}
        />
        <AttributeSelect
          control={control}
          fieldName="height"
          label="Height"
          options={ATTRIBUTES.height.options}
          error={errors.height}
          isSubmitting={isSubmitting}
        />
        <AttributeSelect
          control={control}
          fieldName="weight"
          label="Weight"
          options={ATTRIBUTES.weight.options}
          error={errors.weight}
          isSubmitting={isSubmitting}
        />
        <AttributeSelect
          control={control}
          fieldName="howDidYouHearAboutUs"
          label="How did you hear about us?"
          options={ATTRIBUTES.howDidYouHearAboutUs.options}
          error={errors.howDidYouHearAboutUs}
          isSubmitting={isSubmitting}
        />
      </div>
    </fieldset>
  );
}
