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
import { Eye } from "lucide-react";

export default async function StudioCard({ studio, index }) {
  if (!studio.downloaded) {
    const targetDate = add(parseISO(studio.created_at), { days: 7 });
    if (isAfter(new Date(), targetDate)) {
      await updateStudioDownloadStatus(studio.id);
      studio.downloaded = true;
    }
  }

  return (
    <Card className="group shadow-none rounded-lg transition-all duration-300 h-full flex flex-col overflow-hidden border border-border/50">
      <CardHeader className="relative aspect-[4/5] p-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-primary/30 group-hover:opacity-80 transition-opacity duration-300 z-10" />
        {/* <Image
          src="/examples/ai-portrait-1.jpg"
          alt={`Studio ${index + 1}`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        /> */}
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <span className="text-8xl font-extrabold text-white/90 drop-shadow-lg">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
        {/* <Badge
          variant="secondary"
          className="absolute top-3 right-3 z-20 bg-background/80 backdrop-blur-sm font-medium"
        >
          {studio.gender.toUpperCase()}
        </Badge> */}
      </CardHeader>
      <CardContent className="p-4 space-y-3 flex-grow">
        <CardTitle className="text-xl line-clamp-1 group-hover:text-primary transition-colors">
          {studio.title}
        </CardTitle>
        <div className="text-xs text-muted-foreground space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-medium">Status:</span>
            <Badge
              variant={studio.downloaded ? "success" : "destructive"}
              className="text-xs"
            >
              {studio.downloaded ? "Downloaded" : "Not Downloaded"}
            </Badge>
          </div>
          <p className="flex items-center justify-between">
            <span className="font-medium">Created:</span>
            <span>{format(parseISO(studio.created_at), "MMM d, yyyy")}</span>
          </p>
          {/* <p className="flex items-center justify-between">
            <span className="font-medium">Sharing:</span>
            <span>{studio.sharing_permission ? "Enabled" : "Disabled"}</span>
          </p> */}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          asChild
          className="w-full group-hover:bg-primary/90 transition-colors"
        >
          <Link
            href={`/dashboard/studio/${studio.id}`}
            className="flex items-center justify-center"
          >
            <Eye className="mr-2 h-4 w-4" />
            View Headshots
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
