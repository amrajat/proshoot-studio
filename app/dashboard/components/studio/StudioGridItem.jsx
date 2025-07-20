import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, DownloadCloud, User, Building, Clock } from "lucide-react";

export default function StudioGridItem({
  studio,
  studioImageUrl,
  isOrgAdminView = false,
}) {
  return (
    <div className="bg-card border rounded-lg shadow-sm overflow-hidden flex flex-col">
      <Link href={`/dashboard/studio/${studio.id}`} className="block group">
        <div className="relative w-full aspect-[16/10] bg-muted overflow-hidden">
          {studioImageUrl ? (
            <Image
              src={studioImageUrl}
              alt={studio.name || "Studio image"}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              priority={false} // Set to true for above-the-fold images if applicable
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <Image
                src="/placeholder.svg"
                alt="Placeholder"
                width={80}
                height={80}
                className="text-muted-foreground"
              />
            </div>
          )}
          {isOrgAdminView && studio.profiles && (
            <div className="absolute bottom-2 left-2 bg-black/50 text-white p-1.5 rounded text-xs">
              <p className="font-semibold">
                {studio.profiles.full_name || "N/A"}
              </p>
              <p className="text-gray-300">
                {studio.profiles.email || "No email"}
              </p>
            </div>
          )}
        </div>
      </Link>
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex items-start justify-between mb-2">
          <h3
            className="font-semibold text-lg leading-tight truncate group-hover:underline"
            title={studio.name}
          >
            <Link
              href={`/dashboard/studio/${studio.id}`}
              className="hover:underline"
            >
              {studio.name}
            </Link>
          </h3>
          <Badge
            variant={
              studio.status === "completed"
                ? "default"
                : studio.status === "failed"
                ? "destructive"
                : "outline"
            }
            className="ml-2 shrink-0"
          >
            {studio.status}
          </Badge>
        </div>

        <div className="text-sm text-muted-foreground mb-1 flex items-center">
          {studio.organization_id && studio.organizations ? (
            <>
              <Building className="mr-1.5 h-4 w-4" />
              <span title={studio.organizations.name}>
                {studio.organizations.name}
              </span>
            </>
          ) : (
            <>
              <User className="mr-1.5 h-4 w-4" />
              <span>Personal</span>
            </>
          )}
        </div>

        <div className="text-sm text-muted-foreground mb-3 flex items-center">
          <Clock className="mr-1.5 h-4 w-4" />
          <span>{new Date(studio.created_at).toLocaleDateString()}</span>
        </div>

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-dashed">
          <div className="flex items-center text-sm">
            {studio.downloaded ? (
              <DownloadCloud className="mr-1.5 h-4 w-4 text-green-500" />
            ) : (
              <DownloadCloud className="mr-1.5 h-4 w-4 text-orange-500" />
            )}
            <span
              className={
                studio.downloaded ? "text-green-600" : "text-orange-600"
              }
            >
              {studio.downloaded ? "Results Ready" : "Preview Only"}
            </span>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href={`/dashboard/studio/${studio.id}`}>
              <Eye className="mr-1 h-4 w-4" /> View
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
