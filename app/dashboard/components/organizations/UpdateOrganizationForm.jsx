"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";
import { useAccountContext } from "@/context/AccountContext";
import createSupabaseBrowserClient from "@/lib/supabase/browser-client";

const organizationSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Organization name must be at least 2 characters." })
    .max(50, { message: "Organization name must not exceed 50 characters." }),
  team_size: z.coerce
    .number()
    .min(1, { message: "Team size must be at least 1." }),
});

export default function UpdateOrganizationForm({ onSuccess }) {
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [organizationData, setOrganizationData] = useState(null);
  const { userId, refreshContext, setSelectedContext, availableContexts } =
    useAccountContext();
  const supabase = createSupabaseBrowserClient();

  const form = useForm({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: "",
      team_size: 2,
    },
  });

  // Pre-fetch organization data
  useEffect(() => {
    const fetchOrganizationData = async () => {
      if (!userId) return;

      try {
        const { data, error } = await supabase
          .from("organizations")
          .select("id, name, team_size")
          .eq("owner_user_id", userId)
          .single();

        if (error) {
          console.error("Error fetching organization:", error);
          return;
        }

        if (data) {
          setOrganizationData(data);
          form.reset({
            name: data.name || "",
            team_size: data.team_size || 2,
          });
        }
      } catch (error) {
        console.error("Error fetching organization:", error);
      }
    };

    fetchOrganizationData();
  }, [userId, supabase, form]);

  const handleSubmit = async (values) => {
    if (!organizationData?.id) {
      setFormError("Organization not found");
      return;
    }

    setIsLoading(true);
    setFormError(null);

    try {
      const { error } = await supabase
        .from("organizations")
        .update({
          name: values.name,
          team_size: values.team_size,
        })
        .eq("id", organizationData.id);

      if (error) {
        throw error;
      }

      // Refresh context to get updated data
      await refreshContext();

      // Switch to organization context
      const orgContext = availableContexts.find(
        (ctx) => ctx.type === "organization" && ctx.id === organizationData.id
      );

      if (orgContext) {
        await setSelectedContext(orgContext);
      }

      onSuccess?.(organizationData.id);
    } catch (error) {
      console.error("Error updating organization:", error);
      setFormError(
        error?.message || "Failed to update organization. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!organizationData) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading organization...</span>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
              <FormLabel>Organization Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Your Company Inc."
                  {...field}
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
                  placeholder="2"
                  {...field}
                  min="1"
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                How many people are in your team?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Update Organization
        </Button>
      </form>
    </Form>
  );
}
