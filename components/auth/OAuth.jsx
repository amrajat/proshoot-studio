"use server";

import { signInWithOAuth } from "@/lib/supabase/actions/server";
import { cookies } from "next/headers";
import { Button } from "@/components/ui/button";
import { GoogleIcon, LinkedInIcon } from "@/components/shared/icons";
import { Badge } from "@/components/ui/badge";

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
        {lastSignedInMethod === provider && <Badge>last used</Badge>}
      </Button>
    </form>
  );
}

export default OAuth;
