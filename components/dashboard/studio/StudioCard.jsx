import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import { format, isAfter, parseISO, add } from "date-fns";
import { updateStudioDownloadStatus } from "@/lib/supabase/actions/server";

export default async function StudioCard({ studio, index }) {
  if (!studio.downloaded) {
    const targetDate = add(parseISO(studio.created_at), { days: 7 });
    if (isAfter(new Date(), targetDate)) {
      await updateStudioDownloadStatus(studio.id);
      studio.downloaded = true;
    }
  }

  return (
    <Card className="group rounded shadow-none">
      <CardHeader className="relative aspect-[4/5] p-0 overflow-hidden rounded">
        <Image
          src="/examples/ai-portrait-1.jpg"
          alt={`Studio ${index + 1}`}
          fill
          className="object-cover blur-3xl"
        />
        <span className="absolute inset-0 flex items-center justify-center text-9xl font-extrabold text-primary-foreground">
          {String(index + 1).padStart(2, "0")}
        </span>
      </CardHeader>
      <CardContent className="p-4 space-y-2">
        <Badge variant="outline">{studio.gender.toUpperCase()}</Badge>
        <CardTitle>{studio.title}</CardTitle>
        <div className="text-xs text-muted-foreground space-y-1">
          <p>Downloaded: {studio.downloaded ? "Yes" : "No"}</p>
          <p>Created: {format(parseISO(studio.created_at), "PPpp")}</p>
          <p>Sharing Permission: {studio.sharing_permission ? "Yes" : "No"}</p>
        </div>
      </CardContent>
      <CardFooter className="p-4">
        <Button asChild className="w-full">
          <Link href={`/dashboard/studio/${studio.id}`}>View Studio</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
