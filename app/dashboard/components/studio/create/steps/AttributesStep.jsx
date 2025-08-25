/**
 * Attributes Step Component
 * Collects user physical attributes for better AI generation
 */

import React, { useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, WandSparkles, SmilePlus } from "lucide-react";
import { useAccountContext } from "@/context/AccountContext";
import StepNavigation from "../components/StepNavigation";
import useStudioCreateStore from "@/stores/studioCreateStore";

// New attribute options - all values in lowercase
const GENDERS = ["man", "woman", "non-binary"];

const ETHNICITIES = [
  "African",
  "Caucasian",
  "European",
  "East Asian",
  "Hispanic Latino",
  "Indigenous",
  "Jewish",
  "Middle Eastern",
  "Multiracial",
  "Native American",
  "North African",
  "Pacific Islander",
  "Romani",
  "South Asian",
  "Southeast Asian",
  "Other",
];

// Hair Attributes by Gender
const HAIR_LENGTH = {
  man: [
    "bald",
    "buzz cut",
    "short cropped",
    "fade",
    "taper",
    "undercut",
    "medium length",
    "bro flow",
    "long",
    "man bun",
    "top knot",
  ],
  woman: [
    "pixie cut",
    "bald",
    "bob cut",
    "lob",
    "long bob",
    "medium length",
    "long",
    "layered cut",
    "updo",
    "bun",
    "hisab",
  ],
  "non-binary": [
    "bald",
    "buzz cut",
    "short cropped",
    "fade",
    "taper",
    "undercut",
    "medium length",
    "bro flow",
    "long",
    "man bun",
    "top knot",
  ],
};

const HAIR_COLOR = {
  man: [
    "jet black",
    "natural black",
    "dark brown",
    "medium brown",
    "light brown",
    "golden blonde",
    "ash blonde",
    "platinum blonde",
    "ginger",
    "red",
    "auburn",
    "salt & pepper",
    "silver",
    "gray",
    "white",
  ],
  woman: [
    "jet black",
    "natural black",
    "dark brown",
    "espresso",
    "chestnut brown",
    "medium brown",
    "light brown",
    "golden blonde",
    "ash blonde",
    "platinum blonde",
    "strawberry blonde",
    "ginger",
    "auburn",
    "deep red",
    "burgundy",
    "salt & pepper",
    "silver",
    "gray",
    "white",
    "highlights",
    "balayage",
    "ombré",
  ],
  "non-binary": [
    "jet black",
    "natural black",
    "dark brown",
    "medium brown",
    "light brown",
    "golden blonde",
    "ash blonde",
    "platinum blonde",
    "ginger",
    "red",
    "auburn",
    "salt & pepper",
    "silver",
    "gray",
    "white",
    "dark brown",
    "espresso",
    "chestnut brown",
    "strawberry blonde",
    "deep red",
    "burgundy",
    "highlights",
    "balayage",
    "ombré",
  ],
};

const HAIR_TYPE = {
  man: ["straight", "wavy", "curly", "coily", "afro-textured", "dreadlocks"],
  woman: [
    "straight",
    "wavy",
    "curly",
    "coily",
    "afro-textured",
    "dreadlocks",
    "braids",
  ],
  "non-binary": [
    "straight",
    "wavy",
    "curly",
    "coily",
    "afro-textured",
    "dreadlocks",
    "braids",
  ],
};

const AttributesStep = ({ formData, errors }) => {
  const {
    updateFormField,
    nextStep,
    prevStep,
    setErrors,
    resetFormCompletely,
    isSubmitting,
  } = useStudioCreateStore();
  const { selectedContext } = useAccountContext();

  // Get current gender for conditional rendering
  const currentGender = formData.gender || "man";

  // Use man attributes for non-binary as specified
  const genderForAttributes =
    currentGender === "non-binary" ? "man" : currentGender;

  // Check if hair length disables hair color and type
  const isHairDisabled = useMemo(() => {
    const hairLength = formData.hairLength?.toLowerCase();
    return hairLength === "bald" || hairLength === "hisab";
  }, [formData.hairLength]);

  const handleFieldChange = (field, value) => {
    // Trim studioName input
    const processedValue = field === "studioName" ? value.trim() : value;
    updateFormField(field, processedValue);

    // Clear hair color and type if hair length is bald or hisab
    if (field === "hairLength" && (value === "bald" || value === "hisab")) {
      updateFormField("hairColor", "");
      updateFormField("hairType", "");
    }
  };

  const handleGlassesChange = (value) => {
    // Use boolean values directly
    const booleanValue = value === "true";
    updateFormField("glasses", booleanValue);
  };

  // Prepopulate studio name with selectedContext name
  useEffect(() => {
    if (selectedContext?.name && !formData.studioName) {
      const defaultStudioName = `${selectedContext.name}'s Headshots`;
      updateFormField("studioName", defaultStudioName);
    }
  }, [selectedContext, formData.studioName, updateFormField]);

  const handleNext = () => {
    const newErrors = {};

    // Required fields
    if (!formData.studioName) {
      newErrors.studioName = "Studio name is required";
    }
    if (!formData.gender) {
      newErrors.gender = "Gender is required";
    }
    if (!formData.ethnicity) {
      newErrors.ethnicity = "Ethnicity is required";
    }
    if (
      formData.glasses === undefined ||
      formData.glasses === null ||
      formData.glasses === ""
    ) {
      newErrors.glasses = "Glasses selection is required";
    }

    // Hair attributes are required unless hair length is bald or hisab
    if (!isHairDisabled) {
      if (!formData.hairLength) {
        newErrors.hairLength = "Hair length is required";
      }
      if (!formData.hairColor) {
        newErrors.hairColor = "Hair color is required";
      }
      if (!formData.hairType) {
        newErrors.hairType = "Hair type is required";
      }
    } else if (!formData.hairLength) {
      newErrors.hairLength = "Hair length is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    nextStep();
  };

  const SelectField = ({
    field,
    label,
    options,
    placeholder = "Select...",
    required = false,
    disabled = false,
  }) => (
    <div className="space-y-2">
      <Label
        htmlFor={field}
        className={disabled ? "text-muted-foreground" : ""}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Select
        value={formData[field] || ""}
        onValueChange={(value) => handleFieldChange(field, value)}
        disabled={disabled}
      >
        <SelectTrigger
          className={`${errors[field] ? "border-destructive" : ""} ${
            disabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <SelectValue
            placeholder={disabled ? "Not applicable" : placeholder}
          />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {errors[field] && (
        <p className="text-sm text-destructive">{errors[field]}</p>
      )}
    </div>
  );

  const GlassesField = () => (
    <div className="space-y-2">
      <Label htmlFor="glasses">
        Do you want Glasses?
        <span className="text-red-500 ml-1">*</span>
      </Label>
      <Select
        value={
          formData.glasses === true
            ? "true"
            : formData.glasses === false
            ? "false"
            : ""
        }
        onValueChange={handleGlassesChange}
      >
        <SelectTrigger className={errors.glasses ? "border-destructive" : ""}>
          <SelectValue placeholder="Select glasses option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="true">Yes</SelectItem>
          <SelectItem value="false">No</SelectItem>
        </SelectContent>
      </Select>
      {errors.glasses && (
        <p className="text-sm text-destructive">{errors.glasses}</p>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">Your attributes</h2>
        <p className="text-muted-foreground">
          Inputs are used solely to improve AI accuracy and is kept private.
        </p>
      </div>

      {/* Basics Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SmilePlus className="h-5 w-5" />
            Basics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="studioName">
                Studio Name
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="studioName"
                placeholder="e.g., Your name"
                value={formData.studioName || ""}
                onChange={(e) =>
                  handleFieldChange("studioName", e.target.value)
                }
                className={errors.studioName ? "border-destructive" : ""}
              />
              {errors.studioName && (
                <p className="text-sm text-destructive">{errors.studioName}</p>
              )}
            </div>
            <SelectField
              field="gender"
              label="Gender"
              options={GENDERS}
              placeholder="Select gender"
              required={true}
            />
            <SelectField
              field="ethnicity"
              label="Ethnicity"
              options={ETHNICITIES}
              placeholder="Select ethnicity"
              required={true}
            />
          </div>
        </CardContent>
      </Card>

      {/* Appearances */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <WandSparkles className="h-5 w-5" />
            Appearances
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isHairDisabled && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Hair color and type are not applicable when hair length is
                "bald" or "hisab".
              </AlertDescription>
            </Alert>
          )}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <SelectField
              field="hairLength"
              label="Hair Length"
              options={HAIR_LENGTH[genderForAttributes] || HAIR_LENGTH.man}
              placeholder="Select length"
              required={true}
            />
            <SelectField
              field="hairColor"
              label="Hair Color"
              options={HAIR_COLOR[genderForAttributes] || HAIR_COLOR.man}
              placeholder="Select color"
              required={false}
              disabled={isHairDisabled}
            />
            <SelectField
              field="hairType"
              label="Hair Type"
              options={HAIR_TYPE[genderForAttributes] || HAIR_TYPE.man}
              placeholder="Select type"
              required={false}
              disabled={isHairDisabled}
            />
            <GlassesField />
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <StepNavigation
        onNext={handleNext}
        onPrevious={prevStep}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default AttributesStep;
