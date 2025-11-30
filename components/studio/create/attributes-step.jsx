/**
 * Attributes Step Component
 * Collects user physical attributes for better AI generation
 */

import React, { useMemo, useEffect, useRef } from "react";
import Image from "next/image";
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
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Info, WandSparkles, SmilePlus, HelpCircle } from "lucide-react";
import { useAccountContext } from "@/context/AccountContext";
import StepNavigation from "@/components/studio/create/step-navigation";
import useStudioCreateStore from "@/stores/studioCreateStore";

// New attribute options - all values in lowercase
const GENDERS = ["man", "woman", "non-binary"];

const ETHNICITIES = [
  "Caucasian",
  "African",
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
];

// Hair Attributes by Gender
const HAIR_LENGTH = {
  man: [
    "bald",
    "buzz cut",
    "short-cropped",
    "fade",
    "taper",
    "undercut",
    "medium-length",
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
    "medium-length",
    "long",
    "layered cut",
    "updo",
    "bun",
    "hijab",
  ],
  "non-binary": [
    "bald",
    "buzz cut",
    "short-cropped",
    "fade",
    "taper",
    "undercut",
    "medium-length",
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

// Body Type options by gender (man/non-binary share same options)
const BODY_TYPE = {
  man: ["slim", "regular", "athletic", "broad", "large", "plus size"],
  woman: ["slim", "regular", "curvy", "full figured", "plus size"],
  "non-binary": ["slim", "regular", "athletic", "broad", "large", "plus size"],
};

// Help images configuration for appearance fields
// Images are stored in /images/attributes-guideline/{gender}/{imageName}.png
const HELP_IMAGES = {
  hairLength: {
    imageName: "hair-length-guide.png",
    alt: "Hair length examples showing different styles",
  },
  hairColor: {
    imageName: "hair-color-guide.png",
    alt: "Hair color examples showing different shades",
  },
  hairType: {
    imageName: "hair-type-guide.png",
    alt: "Hair type examples showing straight, wavy, curly styles",
  },
  bodyType: {
    imageName: "body-type-guide.png",
    alt: "Body type examples showing different builds",
  },
};

const AttributesStep = ({ formData, errors }) => {
  const { updateFormField, nextStep, prevStep, setErrors, isSubmitting } =
    useStudioCreateStore();
  const { selectedContext } = useAccountContext();

  // Track if studio name has been manually edited
  const hasUserEditedName = useRef(false);

  // Get current gender for conditional rendering
  const currentGender = formData.gender || "man";

  // Use man attributes for non-binary as specified
  const genderForAttributes =
    currentGender === "non-binary" ? "man" : currentGender;

  // Check if hair length disables hair color and type
  const isHairDisabled = useMemo(() => {
    const hairLength = formData.hairLength?.toLowerCase();
    return hairLength === "bald" || hairLength === "hijab";
  }, [formData.hairLength]);

  const handleFieldChange = (field, value) => {
    updateFormField(field, value);

    // Clear hair color and type if hair length is bald or hijab
    if (field === "hairLength" && (value === "bald" || value === "hijab")) {
      updateFormField("hairColor", "");
      updateFormField("hairType", "");
    }
  };

  const handleGenderChange = (value) => {
    updateFormField("gender", value);

    // Always reset all hair attributes and body type when gender changes
    // This forces user to reselect options for the new gender
    updateFormField("hairLength", "");
    updateFormField("hairColor", "");
    updateFormField("hairType", "");
    updateFormField("bodyType", "");
  };

  const handleGlassesChange = (value) => {
    // Use boolean values directly
    const booleanValue = value === "true";
    updateFormField("glasses", booleanValue);
  };

  // Handle studio name change separately to track user edits
  const handleStudioNameChange = (value) => {
    hasUserEditedName.current = true;
    updateFormField("studioName", value);
  };

  // Prepopulate studio name with selectedContext name (only once on mount)
  useEffect(() => {
    if (selectedContext?.name && !formData.studioName && !hasUserEditedName.current) {
      updateFormField("studioName", selectedContext.name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedContext?.name]);

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

    // Hair length is always required
    if (!formData.hairLength) {
      newErrors.hairLength = "Hair length is required";
    } else {
      // Validate hair length is valid for current gender
      const validHairLengths =
        HAIR_LENGTH[genderForAttributes] || HAIR_LENGTH.man;
      if (!validHairLengths.includes(formData.hairLength)) {
        newErrors.hairLength =
          "Please select a valid hair length for the selected gender";
      }
    }

    // Body type is always required
    if (!formData.bodyType) {
      newErrors.bodyType = "Body type is required";
    } else {
      // Validate body type is valid for current gender
      const validBodyTypes = BODY_TYPE[currentGender] || BODY_TYPE.man;
      if (!validBodyTypes.includes(formData.bodyType)) {
        newErrors.bodyType =
          "Please select a valid body type for the selected gender";
      }
    }

    // Hair color and type are required unless hair length is bald or hijab
    if (!isHairDisabled) {
      if (!formData.hairColor) {
        newErrors.hairColor = "Hair color is required";
      } else {
        // Validate hair color is valid for current gender
        const validHairColors =
          HAIR_COLOR[genderForAttributes] || HAIR_COLOR.man;
        if (!validHairColors.includes(formData.hairColor)) {
          newErrors.hairColor =
            "Please select a valid hair color for the selected gender";
        }
      }

      if (!formData.hairType) {
        newErrors.hairType = "Hair type is required";
      } else {
        // Validate hair type is valid for current gender
        const validHairTypes = HAIR_TYPE[genderForAttributes] || HAIR_TYPE.man;
        if (!validHairTypes.includes(formData.hairType)) {
          newErrors.hairType =
            "Please select a valid hair type for the selected gender";
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    nextStep();
  };

  // Determine which gender folder to use for help images
  // Default to "man" if no gender selected or if non-binary
  const helpImageGender = currentGender === "woman" ? "woman" : "man";

  // Help dialog component for appearance fields - renders large centered image
  const HelpDialog = ({ field }) => {
    const helpConfig = HELP_IMAGES[field];
    if (!helpConfig) return null;

    const imageSrc = `/images/attributes-guideline/${helpImageGender}/${helpConfig.imageName}`;

    return (
      <Dialog>
        <DialogTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
            aria-label={`View ${field} guide`}
            tabIndex={0}
          >
            <HelpCircle className="h-4 w-4" />
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl w-[95vw] p-2 sm:p-4 flex items-center justify-center">
          <div className="relative w-full aspect-auto">
            <Image
            src={imageSrc}
            alt={helpConfig.alt}
              width={1200}
              height={800}
              className="w-full h-auto rounded-md object-contain"
              priority
              sizes="(max-width: 768px) 95vw, (max-width: 1200px) 80vw, 900px"
          />
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const SelectField = ({
    field,
    label,
    options,
    placeholder = "Select...",
    required = false,
    disabled = false,
    showHelp = false,
  }) => (
    <div className="space-y-2">
      <Label
        htmlFor={field}
        className={`flex items-center gap-1.5 ${disabled ? "text-muted-foreground" : ""}`}
      >
        {label}
        {showHelp && <HelpDialog field={field} />}
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
      <Label htmlFor="glasses" className="flex items-center gap-1.5">
        Glasses
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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="text-center space-y-1 sm:space-y-2">
        <h2 className="text-xl sm:text-2xl font-semibold">Your attributes</h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Inputs are used solely to improve AI accuracy and kept private.
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="studioName" className="flex items-center gap-1.5">
                Your Name
              </Label>
              <Input
                id="studioName"
                placeholder="e.g., Your name"
                value={formData.studioName || ""}
                onChange={(e) => handleStudioNameChange(e.target.value)}
                className={errors.studioName ? "border-destructive" : ""}
              />
              {errors.studioName && (
                <p className="text-sm text-destructive">{errors.studioName}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender" className="flex items-center gap-1.5">
                Gender
              </Label>
              <Select
                value={formData.gender || ""}
                onValueChange={handleGenderChange}
              >
                <SelectTrigger
                  className={errors.gender ? "border-destructive" : ""}
                >
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  {GENDERS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.gender && (
                <p className="text-sm text-destructive">{errors.gender}</p>
              )}
            </div>
            <SelectField
              field="ethnicity"
              label="Ethnicity"
              options={ETHNICITIES}
              placeholder="Select ethnicity"
              required={true}
            />
            <GlassesField />
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
                "bald" or "hijab".
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
              // showHelp={true}
            />
            <SelectField
              field="hairColor"
              label="Hair Color"
              options={HAIR_COLOR[genderForAttributes] || HAIR_COLOR.man}
              placeholder="Select color"
              required={!isHairDisabled}
              disabled={isHairDisabled}
              // showHelp={true}
            />
            <SelectField
              field="hairType"
              label="Hair Type"
              options={HAIR_TYPE[genderForAttributes] || HAIR_TYPE.man}
              placeholder="Select type"
              required={!isHairDisabled}
              disabled={isHairDisabled}
              // showHelp={true}
            />
            <SelectField
              field="bodyType"
              label="Body Type"
              options={BODY_TYPE[currentGender] || BODY_TYPE.man}
              placeholder="Select body type"
              required={true}
              // showHelp={true}
            />
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
