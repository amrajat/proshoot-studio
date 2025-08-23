import {
  LayoutGrid,
  LucideIcon,
  Shirt,
  Coins,
  ReceiptText,
  Image,
  ImagePlus,
  Images,
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
      groupLabel: "Home",
      menus: [
        {
          href: "/dashboard",
          label: "Dashboard",
          icon: LayoutGrid,
          submenus: [],
        },
      ],
    },
    {
      groupLabel: "Styles",
      menus: [
        {
          href: "/dashboard/clothing",
          label: "Outfits",
          icon: Shirt,
          submenus: [],
        },
        {
          href: "/dashboard/backgrounds",
          label: "Backgrounds",
          icon: Images,
          submenus: [],
        },
      ],
    },
    {
      groupLabel: "Headshots",
      menus: [
        {
          href: "/dashboard/studio",
          label: "All Headshots",
          icon: Image,
        },
        {
          href: "/dashboard/studio/create",
          label: "Create Headshots",
          icon: ImagePlus,
        },
      ],
    },
    {
      groupLabel: "Billing",
      menus: [
        {
          href: "/dashboard/buy",
          label: "Buy Credits",
          icon: Coins,
          submenus: [
            // {
            //   href: "/dashboard/support",
            //   label: "Support",
            // }
          ],
        },
        {
          href: "/dashboard/billing",
          label: "Billing",
          icon: ReceiptText,
        },
      ],
    },
  ];
}
