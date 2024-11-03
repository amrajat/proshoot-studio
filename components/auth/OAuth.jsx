"use server";

import { signInWithOAuth } from "@/lib/supabase/actions/server";
import { cookies } from "next/headers";
import { Button } from "@/components/ui/button";
import { GoogleIcon, LinkedInIcon } from "@/components/shared/icons";

async function OAuth({ provider }) {
  const cookieJar = cookies();
  const lastSignedInMethod = cookieJar.get("lastSignedInMethod")?.value;

  const providerConfig = {
    google: {
      icon: <GoogleIcon className="w-5 h-5 mr-2" />,
      text: "Continue with Google",
    },
    linkedin_oidc: {
      icon: <LinkedInIcon className="w-5 h-5 mr-2" />,
      text: "Continue with LinkedIn",
    },
  };

  const { icon, text } = providerConfig[provider];

  return (
    <form
      action={async () => {
        "use server";
        await signInWithOAuth(provider);
      }}
    >
      <Button
        type="submit"
        variant="outline"
        className="w-full justify-center relative"
        size="lg"
      >
        {icon}
        {text}
        {lastSignedInMethod === provider && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary/75 px-2 py-1 rounded text-xs text-primary-foreground">
            Last Used
          </span>
        )}
      </Button>
    </form>
  );
}

export default OAuth;
