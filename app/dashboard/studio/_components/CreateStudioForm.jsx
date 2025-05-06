"use client";

import { useState, useEffect, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { createStudioAction } from "@/app/dashboard/studio/_actions/studioActions";

// Define Zod schema for form validation
const formSchema = z.object({
  contextId: z
    .string()
    .min(1, { message: "Please select a context (Personal or Organization)." }),
  studioName: z
    .string()
    .min(3, { message: "Studio name must be at least 3 characters." })
    .max(50),
  // Credit type MUST come from personal credits now
  creditType: z.enum(["starter", "pro", "elite", "studio"], {
    required_error: "You must select which of your personal credits to use.",
  }),
  previewUrls: z.string().optional(),
  resultUrls: z.string().optional(),
});

// Helper to get available PERSONAL credit types
const getAvailablePersonalCreditTypes = (personalCredits) => {
  if (!personalCredits) return [];
  return [
    { id: "starter", name: "Starter", balance: personalCredits.starter || 0 },
    { id: "pro", name: "Pro", balance: personalCredits.pro || 0 },
    { id: "elite", name: "Elite", balance: personalCredits.elite || 0 },
    { id: "studio", name: "Studio", balance: personalCredits.studio || 0 },
  ].filter((ct) => ct.balance > 0);
};

export default function CreateStudioForm({
  personalCredits,
  memberOrganizations, // <-- UPDATED PROP NAME
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  // Prepare context options for the Select dropdown
  const contextOptions = useMemo(() => {
    const options = [];
    // Add personal if personal credits exist (page already checked if > 0)
    if (personalCredits) {
      options.push({ value: "personal", label: "Personal Account" });
    }
    // Add all member organizations, regardless of their credits
    memberOrganizations?.forEach((org) => {
      options.push({ value: org.id, label: `Organization: ${org.name}` });
    });
    return options;
    // <-- Dependency updated
  }, [personalCredits, memberOrganizations]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      // Default to personal if available and is the first option, else first org, else ""
      contextId: contextOptions[0]?.value || "",
      studioName: "",
      creditType: undefined, // Will be set by useEffect based on personal credits
      previewUrls: "",
      resultUrls: "",
    },
  });

  // Get available credit types based ONLY on personal credits
  const availableCreditTypes = useMemo(
    () => getAvailablePersonalCreditTypes(personalCredits),
    [personalCredits] // <-- Dependency updated
  );

  // Effect to set default creditType based on available PERSONAL credits
  useEffect(() => {
    const firstAvailableCredit = availableCreditTypes[0]?.id;
    // Set the initial value if available, otherwise it remains undefined
    // This runs once on mount and when availableCreditTypes changes (which shouldn't happen after load)
    if (firstAvailableCredit && !form.getValues("creditType")) {
      form.setValue("creditType", firstAvailableCredit, {
        shouldValidate: true, // Validate immediately if we set a default
      });
    }
    // If the previously selected credit type is no longer available (shouldn't happen), reset.
    const currentCreditType = form.getValues("creditType");
    if (
      currentCreditType &&
      !availableCreditTypes.some((ct) => ct.id === currentCreditType)
    ) {
      form.setValue("creditType", firstAvailableCredit, {
        shouldValidate: true,
      });
    }
  }, [availableCreditTypes, form]);

  function onSubmit(values) {
    startTransition(async () => {
      // Ensure the action receives the contextId ('personal' or org UUID)
      // and the creditType (which is guaranteed to be from personalCredits)
      const result = await createStudioAction(values);

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error creating studio",
          description: result.error,
        });
      } else {
        toast({
          title: "Studio Created!",
          description: `Your studio '${values.studioName}' has been created using one of your personal credits.`,
        });
        router.push("/dashboard/studio");
      }
    });
  }

  // Watch selected context ID just for potential conditional logic (though not needed now for credits)
  const selectedContextId = form.watch("contextId");

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 max-w-lg"
      >
        {/* Context Selection */}
        <FormField
          control={form.control}
          name="contextId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Create In</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value} // Ensure value is controlled
                disabled={isPending || contextOptions.length === 0}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select where to create the studio..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {contextOptions.length === 0 && (
                    <SelectItem value="disabled" disabled>
                      No available contexts
                    </SelectItem>
                  )}
                  {contextOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Select 'Personal' or an Organization you are a member of. The
                studio will be associated with this context.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Studio Name */}
        <FormField
          control={form.control}
          name="studioName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Studio Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="My Awesome Headshots"
                  {...field}
                  disabled={isPending}
                />
              </FormControl>
              <FormDescription>
                Give your studio a descriptive name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Credit Type Selection (Based only on Personal Credits) */}
        {availableCreditTypes.length > 0 && (
          <FormField
            control={form.control}
            name="creditType"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Personal Credit Type to Use</FormLabel>{" "}
                {/* Updated Label */}
                <FormControl>
                  <RadioGroup
                    // No need to key by contextId as options don't change based on it
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value} // Ensure value is controlled
                    className="flex flex-col space-y-1"
                    disabled={isPending}
                  >
                    {availableCreditTypes.map((credit) => (
                      <FormItem
                        key={credit.id}
                        className="flex items-center space-x-3 space-y-0"
                      >
                        <FormControl>
                          <RadioGroupItem value={credit.id} />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {credit.name} (Available: {credit.balance})
                        </FormLabel>
                      </FormItem>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormDescription>
                  Select which of your available personal credits to use for
                  this studio.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        {/* Message shown if user has NO personal credits (page shouldn't render form then, but defensive check) */}
        {availableCreditTypes.length === 0 && (
          <p className="text-sm text-destructive">
            You do not have any available personal plan credits (Starter, Pro,
            Elite, Studio) to create a studio.
          </p>
        )}

        {/* Preview URLs */}
        <FormField
          control={form.control}
          name="previewUrls"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preview Headshot URLs</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter one URL per line..."
                  className="resize-y min-h-[100px]"
                  {...field}
                  disabled={isPending}
                />
              </FormControl>
              <FormDescription>
                Optional: Add URLs for watermarked previews (one per line).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Result URLs */}
        <FormField
          control={form.control}
          name="resultUrls"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Result Headshot URLs</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter one URL per line..."
                  className="resize-y min-h-[100px]"
                  {...field}
                  disabled={isPending}
                />
              </FormControl>
              <FormDescription>
                Optional: Add URLs for final headshots (one per line).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          // Disable if pending, no personal credits available, or no context selected
          disabled={
            isPending || availableCreditTypes.length === 0 || !selectedContextId
          }
        >
          {isPending ? "Creating..." : "Create Studio"}
        </Button>
      </form>
    </Form>
  );
}
