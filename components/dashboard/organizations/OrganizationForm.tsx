// app/dashboard/_components/OrganizationForm.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createOrganizationAction,
  updateOrganizationAction,
} from "@/app/dashboard/organization/_actions/organizationActions";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";
import { OrganizationContext } from "@/context/AccountContext";
import { z } from "zod";

// Refine schema for potentially null values
const orgFormSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
  team_size: z.coerce.number().int().nullable(),
  website: z.string().url().nullable(),
  industry: z.string().nullable(),
  department: z.string().nullable(),
  position: z.string().nullable(),
});

// Define the full props for the component
interface OrganizationFormProps {
  mode: "create" | "edit";
  initialData?: OrganizationContext | null;
  onSuccess?: () => void;
}

export default function OrganizationForm({
  mode,
  initialData,
  onSuccess,
}: OrganizationFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof orgFormSchema>>({
    resolver: zodResolver(orgFormSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      team_size: initialData?.team_size ?? null,
      website: initialData?.website ?? "",
      industry: initialData?.industry ?? "",
      department: initialData?.department ?? "",
      position: initialData?.position ?? "",
    },
  });

  async function onSubmit(values: z.infer<typeof orgFormSchema>) {
    console.log("Submitting form:", values);
    setIsLoading(true);
    setFormError(null);

    // Convert empty strings back to null for the database
    const dataToSend = {
      name: values.name,
      team_size: values.team_size || null,
      website: values.website || null,
      industry: values.industry || null,
      department: values.department || null,
      position: values.position || null,
    };

    try {
      let result;
      if (mode === "create") {
        result = await createOrganizationAction(dataToSend);
      } else if (mode === "edit" && initialData?.id) {
        result = await updateOrganizationAction(initialData.id, dataToSend);
      } else {
        throw new Error("Invalid mode or missing initialData for edit.");
      }

      if (result?.error) {
        setFormError(result.error);
      } else {
        toast({
          title: `Organization ${
            mode === "create" ? "created" : "updated"
          }! 🎉`,
          description: `Successfully ${
            mode === "create" ? "created" : "updated"
          } organization: ${values.name}`,
        });
        onSuccess?.();
      }
    } catch (error) {
      console.error(`Error ${mode}ing organization:`, error);
      setFormError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {formError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organization Name *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Your Company Inc."
                  {...field}
                  required
                  aria-required="true"
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="team_size"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Team Size</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="5"
                  {...field}
                  value={field.value ?? ""}
                  min="1"
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website (Optional)</FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder="https://example.com"
                  {...field}
                  value={field.value ?? ""}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="industry"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Industry (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Technology"
                  {...field}
                  value={field.value ?? ""}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="department"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Department (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Marketing"
                  {...field}
                  value={field.value ?? ""}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="position"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Position (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="CEO"
                  {...field}
                  value={field.value ?? ""}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="button"
          onClick={form.handleSubmit(onSubmit)}
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {mode === "create" ? "Create Organization" : "Save Changes"}
        </Button>
      </form>
    </Form>
  );
}
