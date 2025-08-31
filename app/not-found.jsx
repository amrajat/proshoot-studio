import { redirect } from "next/navigation";
import { Suspense } from "react";
import createSupabaseServerClient from "@/lib/supabase/server-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Home, ArrowLeft, Search } from "lucide-react";
import Link from "next/link";
import { PageLoader } from "@/components/shared/universal-loader";

export const metadata = {
  title: "Page Not Found - Proshoot.co",
  description: "The page you're looking for doesn't exist",
};

/**
 * Conditional Not Found Page
 * Shows different UI based on authentication status
 */
async function NotFoundContent() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    const isAuthenticated = user && !authError;

    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${
        isAuthenticated ? '' : 'bg-gradient-to-br from-slate-50 to-slate-100'
      }`}>
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl">Page Not Found</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                The page you're looking for doesn't exist or has been moved.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              {isAuthenticated ? (
                <>
                  <Button asChild className="w-full">
                    <Link href="/">
                      <Home className="mr-2 h-4 w-4" />
                      Go to Dashboard
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/studio">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      View Studios
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild className="w-full">
                    <Link href="/auth">
                      <Home className="mr-2 h-4 w-4" />
                      Sign In
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Go Home
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    console.error("Not found page error:", error);
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
            <Button asChild>
              <Link href="/">Go Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
}

export default function NotFound() {
  return (
    <Suspense fallback={<PageLoader />}>
      <NotFoundContent />
    </Suspense>
  );
}
