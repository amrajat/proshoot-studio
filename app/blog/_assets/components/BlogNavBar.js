import Link from "next/link";
import Logo from "@/components/homepage/Logo";
import { HiArrowRight, HiBars3, HiMiniXMark } from "react-icons/hi2";
import { figtree } from "@/lib/utils";

function BlogNavBar() {
  return (
    <header
      className={
        "flex flex-wrap md:justify-start md:flex-nowrap z-50 w-full text-sm py-3 md:py-0 shadow h-auto bg-white " +
        figtree.className
      }
    >
      <nav
        className="max-w-[85rem] w-full mx-auto px-4 md:px-6 lg:px-8"
        aria-label="Global"
      >
        <div className="relative md:flex md:items-center md:justify-between w-full">
          <div className="flex items-center justify-center">
            <Link className="flex-none" href="/blog">
              <span className="font-bold text-2xl cursor-pointer">Blog</span>
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default BlogNavBar;
