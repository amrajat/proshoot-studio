import { Navbar } from "./navbar";

interface ContentLayoutProps {
  title: string;
  navbar?: boolean;
  children: React.ReactNode;
}

export function ContentLayout({
  title,
  navbar = true,
  children,
}: ContentLayoutProps) {
  return (
    <div>
      {/* {navbar && <Navbar title={title} />} */}
      <div className="mx-auto container pt-20 pb-20 px-4 sm:px-6 md:pb-8 lg:px-8 lg:py-16">
        {children}
      </div>
    </div>
  );
}
