import {
  Users,
  Settings,
  Bookmark,
  SquarePen,
  LayoutGrid,
  LucideIcon,
  GalleryHorizontalEnd,
  Paintbrush,
  User,
  Sparkle,
} from "lucide-react";

type Submenu = {
  href: string;
  label: string;
  active?: boolean;
};

type Menu = {
  href: string;
  label: string;
  active?: boolean;
  icon: LucideIcon;
  submenus?: Submenu[];
};

type Group = {
  groupLabel: string;
  menus: Menu[];
};

export function getMenuList(pathname: string): Group[] {
  return [
    {
      groupLabel: "",
      menus: [
        {
          href: "/dashboard",
          label: "Dashboard",
          icon: LayoutGrid,
          submenus: [],
        },
        {
          href: "/dashboard/clothing",
          label: "Clothing",
          icon: Paintbrush,
          submenus: [],
        },
        {
          href: "/dashboard/backgrounds",
          label: "Backgrounds",
          icon: GalleryHorizontalEnd,
          submenus: [],
        },
      ],
    },
    {
      groupLabel: "Helpful",
      menus: [
        {
          href: "/dashboard",
          label: "Documentation",
          icon: SquarePen,
          submenus: [
            {
              href: "/dashboard/support",
              label: "Support",
            },
            {
              href: "/dashboard/faqs",
              label: "FAQs",
            },
          ],
        },
        {
          href: "/dashboard/billing",
          label: "Billing",
          icon: Bookmark,
        },
      ],
    },
    {
      groupLabel: "Settings",
      menus: [
        {
          href: "/dashboard/teams",
          label: "Teams",
          icon: Users,
        },
        {
          href: "/dashboard/account",
          label: "Account Settings",
          icon: Settings,
        },
        {
          href: "/dashboard/studio",
          label: "Studio",
          icon: User,
        },
        {
          href: "/dashboard/studio/create",
          label: "Create Headshots",
          icon: Sparkle,
        },
      ],
    },
  ];
}
