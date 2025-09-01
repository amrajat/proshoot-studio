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
          href: "/",
          label: "Home",
          icon: LayoutGrid,
          submenus: [],
        },
      ],
    },
    {
      groupLabel: "Styles",
      menus: [
        {
          href: "/clothing",
          label: "Outfits",
          icon: Shirt,
          submenus: [],
        },
        {
          href: "/backgrounds",
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
          href: "/studio",
          label: "All Headshots",
          icon: Image,
        },
        {
          href: "/studio/create",
          label: "Create Headshots",
          icon: ImagePlus,
        },
      ],
    },
    {
      groupLabel: "Billing",
      menus: [
        {
          href: "/buy",
          label: "Buy Credits",
          icon: Coins,
          submenus: [
            // {
            //   href: "/support",
            //   label: "Support",
            // }
          ],
        },
        {
          href: "/billing",
          label: "Billing",
          icon: ReceiptText,
        },
      ],
    },
  ];
}
